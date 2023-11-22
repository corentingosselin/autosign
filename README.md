# 📝 Autosign

🚀 This Node.js application automates the process of signing documents. It fetches signatures that need to be signed, signs them automatically, and sends email notifications about the signing status.

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

- ✅ You have installed Node.js.
- 🧠 You have a basic understanding of JavaScript and Node.js.

## 💾 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/corentingosselin/autosign.git
   ```
2. Navigate to the project directory:
   ```bash
   cd autosign
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```

## ⚙️ Configuration

### 🔑 Setting Up Credentials

1. **Cookie**: 
   🌐 https://app.edsquare.fr/apps/classrooms
   - 🍪 Obtain the cookie by logging into the website, opening developer tools in your browser, going to the Network tab, and clicking on any request. Copy the cookie from the request headers. Make sure you are logged.

2. **Email Credentials**: 
   - 📧 This application uses a Microsoft account to send emails. You will need to generate an app password for your Microsoft account.
   - 🗝️ To generate an app password, follow these steps:
     1. Go to the [Microsoft Security basics page](https://account.microsoft.com/security) and sign in with your Microsoft account.
     2. Select "More security options."
     3. Under "App passwords," select "Create a new app password." A new app password will be generated and appears on your screen.
     4. Copy this app password.

3. **Configure the signature file**:
   - 📁 Save the signature file (e.g., `signature.txt`) in the root directory of the project.
   - ✍️ The application will automatically fetch signatures from this file.
   - 🛠️ To obtain this signature file, follow these steps:
     1. Have a waiting list of signatures to sign.
     2. Open the chrome developer tools and go to the Network tab.
     3. Sign a course
     4. In the Network tab, find the request with the signature
     5. Copy the value of course_user_signature[signature_data] from the request payload 
     6. Paste this value into the signature file.
     7. Also copy the content-length value from the request headers and paste it into autosign.js with variable name: signatureLength
     8. 📝 Important information, the signature will have the same pattern for every signature.

4. **Configure the Application**:
   - 💻 Open the application's main script file (e.g., `autosign.js`).
   - 🔧 Replace the placeholder values for the cookie and email credentials with your actual credentials.
   - 🔄 Replace the signatureLength value with the content-length value from the request headers.

## 🚀 Usage

To run the application, use the following command in the project directory:

```bash
node autosign.js
```

🤖 The application will automatically fetch signatures, process them, and send email notifications based on the status of each signature.

## 🕒 Setup Automatic Cron

If you don't want to run the application manually, you can set up a cron job to run it automatically.

This cron should run at 8:02 AM and 1:02 PM every day.

🐧 I will explain how to do it on a Linux server later.
🐳 This application will also be dockerized.

🔧 DOCUMENTATION WORK IN PROGRESS

## 🆘 Support

This is a private project, so no support will be provided if you are not a student of the school.
