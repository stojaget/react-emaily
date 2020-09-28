// surveyField contains logic to render single label and text inputs
import React from "react";
// iz propsa napravi destructuring i uzmi input property, meta nam je za prikaz greški
export default ({ input, label, meta: { error, touched } }) => {
  return (
    <div>
      <label>{label}</label>
      <input {...input} style={{ marginBottom: "5px" }} />
      {/* da ne bi pokazivao validaciju kada se prvi put prikaže forma */}
      <div className="red-text" style={{ marginBottom: "20px" }}>
        {touched && error}
      </div>
    </div>
  );
};
