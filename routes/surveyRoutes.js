const _ = require("lodash");
const { Path } = require("path-parser");
const { URL } = require("url");
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const requireCredits = require("../middlewares/requireCredits");
const Mailer = require("../services/Mailer");
const surveyTemplate = require("../services/emailTemplates/surveyTemplate");

const Survey = mongoose.model("surveys");

module.exports = (app) => {
  app.get("/api/surveys", requireLogin, async (req, res) => {
    const surveys = await Survey.find({ _user: req.user.id }).select({
      recipients: false,
    });
    res.send(surveys);
  });

  app.get("/api/surveys/:surveyId/:choice", (req, res) => {
    res.send("Thanks for voting!");
  });

  app.post("/api/surveys/webhooks", (req, res) => {
    // izvlaičimo route i id, surveyId i choice
    const p = new Path("/api/surveys/:surveyId/:choice");
    // lodash chain function da ujedini pozive na lodash
    _.chain(req.body)
      .map(({ email, url }) => {
        // one zapise koji nemaju id i choice izbacujemo, p.test vrati null ako nemaju uvjete
        const match = p.test(new URL(url).pathname);

        if (match) {
          return {
            email,
            surveyId: match.surveyId,
            choice: match.choice,
          };
        }
      })
      .compact()
      // osigurava da ne postoje 2 maila sa istim id-em za taj survey
      .uniqBy(compactEvents, "email", "surveyId")
      .each(({ surveyId, email, choice }) => {
        // odi u survey, nađi onoga sa id-jem i updateaj ga, a zatim u recipients pronađi email i responded
        Survey.updateOne(
          {
            id: surveyId,
            recipients: {
              $elemMatch: { email: email, responded: false },
            },
          },
          {
            // mongo operator, find the choice property and increment by 1, da li je DA ili NE odlučujemo s [choice] varijablom, to niej polje, [choice] = 'yes' || 'no'
            $inc: { [choice]: 1 },
            // stavlja responded u true, $ je ko elemMatch ovdje
            $set: { "recipients.$.responded": true },
            lastResponded: new Date(),
          }
          // execute query nad mongodb, async je
        ).exec();
      })
      .value();

    res.send({});
  });

  app.post("/api/surveys", requireLogin, requireCredits, async (req, res) => {
    const { title, subject, body, recipients } = req.body;

    const survey = new Survey({
      title,
      subject,
      body,
      recipients: recipients
        .split(",")
        .map((email) => ({ email: email.trim() })),
      _user: req.user.id,
      dateSent: Date.now(),
    });

    // Great place to send an email!
    const mailer = new Mailer(survey, surveyTemplate(survey));

    try {
      await mailer.send();
      await survey.save();
      req.user.credits -= 1;
      const user = await req.user.save();

      res.send(user);
    } catch (err) {
      res.status(422).send(err);
    }
  });
};
