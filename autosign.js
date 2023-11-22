const request = require("request");

/* 

This cookie is the one you get when you log in to the website
You can get it by going to the website, opening the dev tools, going to the network tab, and clicking on any request.
Then, you can copy the cookie from the request headers.

*/
const cookie = "Your auth cookie here";
const signatureLength = 4189; // replace your signature length here

const nodemailer = require("nodemailer");
/**
    How to create a new app password
    To create a new app password for an app or device, take the following steps. 
    Go to the Security basics page and sign in to your Microsoft account.

    You may need to enable 2FA on your account first if you do not see App passwords under More security options.

    Select More security options. 

    Under App passwords, select Create a new app password. A new app password is generated and appears on your screen.

    Enter this app password where you would enter your normal Microsoft account password in the application.

    https://support.microsoft.com/en-us/account-billing/using-app-passwords-with-apps-that-don-t-support-two-step-verification-5896ed9b-4263-e681-128a-a6f2979a7944
 */
let transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "myemail@outlook.com", //replace this with your email
    pass: "your app password", //replace this with your app password
  },
});

const from = "myemail@outlook.com"; //replace this with your email
const to = "targetemail@gmail.com"; //replace this with the email you want to send the email to

function sendMail(mailOptions) {
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
}

function fetchCsrfToken() {
  return new Promise((resolve, reject) => {
    const fetchCsrfTokenRequest = {
      method: "GET",
      url: "https://app.edsquare.fr/apps/classrooms",
      headers: {
        Cookie: cookie,
      },
    };

    request(fetchCsrfTokenRequest, function (error, response) {
      if (error) {
        reject(error);
      } else {
        const csrfTokenMatch = response.body.match(
          /<meta name="csrf-token" content="([^"]+)"/
        );
        if (csrfTokenMatch && csrfTokenMatch.length > 1) {
          const csrfToken = csrfTokenMatch[1];
          resolve(csrfToken);
        } else {
          reject("CSRF token not found");
        }
      }
    });
  });
}

// Prepare request to fetch signatures needed
const fetchSignatureRequest = {
  method: "GET",
  url: "https://app.edsquare.fr/apps/course_user_signatures/fetch",
  headers: {
    Cookie: cookie,
  },
};

signatureToProcess = [];
function fetchSignature() {
  request(fetchSignatureRequest, function (error, response) {
    if (error) throw new Error(error);
    if (response.body.includes("Aucun émargement en attente")) {
      console.log(
        "Nous n'avons pas trouvé de signature à émarger ! Veuillez vérifier manuellement."
      );

      const mailOptions = {
        subject: "Autosign Attention",
        from,
        to,
        text: "Nous n'avons pas trouvé de signature à émarger ! Veuillez vérifier manuellement.",
      };
      sendMail(mailOptions);

      return;
    }

    const signatureLinks = response.body.match(
      /href="\/apps\/course_user_signatures\/new\?event_id=[^"]+"/g
    );
    if (signatureLinks) {
      signatureLinks.forEach((link) => {
        const signatureId = link.split("event_id=")[1].split('"')[0].trim();
        fetchCourseId(signatureId);
      });
    }
  });
}

function extractCourseId(body) {
  const regex = /<input[^>]*>/g;
  // Apply the regular expression to the HTML content
  const matches = body.match(regex);

  // Check if a match was found
  if (matches) {
    //take the first match
    const input = matches[0];
    const inputPattern = /<input[^>]+>/;

    // Find the input element
    const inputMatch = input.match(inputPattern);

    if (inputMatch) {
      // Extract the input element string
      const inputElement = inputMatch[0].replace(/\\/g, "");

      // Pattern to find the value within the input element
      const valuePattern = /value="([^"]+)"/;

      // Find the value
      const valueMatch = inputElement.match(valuePattern);

      if (valueMatch) {
        // Extracted value
        const extractedValue = valueMatch[1];
        return extractedValue;
      } else {
        console.log("Value attribute not found in the input element");
      }
    } else {
      console.log("Input element not found in the file");
    }
  } else {
    console.log("No input elements found");
  }
  return null;
}

function fetchCourseId(signatureId) {
  const fetchCourseRequest = {
    method: "GET",
    url:
      "https://app.edsquare.fr/apps/course_user_signatures/new?event_id=" +
      signatureId,
    headers: {
      Cookie: cookie,
      "X-Requested-With": "XMLHttpRequest",
    },
  };

  // send request
  request(fetchCourseRequest, function (error, response) {
    if (error) throw new Error(error);
    const courseId = extractCourseId(response.body);
    console.log("Signing course: ", courseId);
    signatureToProcess.push({ courseId, proccessed: false, error: false });
    sign(courseId);
  });
}

signatureCount = 0;
async function sign(courseId) {
  //read signature from file
  const fs = require("fs");
  const signature = fs.readFileSync("signature.txt", "utf8");

  try {
    const token = await fetchCsrfToken();

    // Prepare request to sign
    const signRequest = {
      method: "POST",
      url: "https://app.edsquare.fr/apps/course_user_signatures",
      headers: {
        Cookie: cookie,
        "X-Requested-With": "XMLHttpRequest",
        "Content-Length": signatureLength,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept:
          "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01",
        "Accept-Language": "fr,en;q=0.9,fr-FR;q=0.8,en-US;q=0.7,de;q=0.6",
        "Accept-Encoding": "gzip, deflate, br",
        Origin: "https://app.edsquare.fr",
        Refer: "https://app.edsquare.fr/apps/classrooms",
        "X-CSRF-Token": token,
      },
      form: {
        "course_user_signature[planning_event_id]": courseId,
        "course_user_signature[signature_data]": signature,
      },
    };
    // send request
    request(signRequest, function (error, response) {
      if (error) {
        console.error("Error signing:", error);
        signatureToProcess.find(
          (s) => s.courseId === courseId
        ).proccessed = true;
        signatureToProcess.find((s) => s.courseId === courseId).error = true;
      } else {
        console.log("Signature enregistrée");
        signatureToProcess.find((s) => s.courseId === courseId).error = false;
      }

      signatureCount++;
      if (signatureCount === signatureToProcess.length) {
        sendMailResult();
      }
    });
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    sendMailResult();
  }
}

function sendMailResult() {
  const mailOptions = {
    subject: "Autosign Result",
    from,
    to,
    text: signatureToProcess
      .map((s) => s.courseId + ": " + (s.error ? "Error" : "Success"))
      .join("\n"),
  };
  sendMail(mailOptions);
}

fetchSignature();
