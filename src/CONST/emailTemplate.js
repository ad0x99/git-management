const buttonGenerate = (
  link,
  text,
) => `<a href="${link}" target="_blank" style="
  border-radius: 5px;
  box-sizing: border-box;
  color: #121d45;
  cursor: pointer;
  display: inline-block;
  font-size: 14px;
  font-weight: bold;
  margin: 0;
  padding: 12px 25px;
  text-decoration: none;
  text-transform: capitalize;
  background-color: #1976d2;
  border-color: #1976d2;
  color: #ffffff;">${text}</a>`;

const template = (
  content,
) => `<table role="presentation" border="0" style="width: 100%;  font-family: sans-serif; font-size: 14px;  background-color: #eaebed;
  width: 100%; ">
    <!-- START CENTERED WHITE CONTAINER -->
    <tr>
        <td style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
            <table role="presentation" style="background: #ffffff; border-radius: 3px; width: 100%;">
            <!-- START MAIN CONTENT AREA -->
            ${content}    
            <!-- END MAIN CONTENT AREA -->
            </table>
        </td>
    </tr>
    <!-- END CENTERED WHITE CONTAINER -->
</table>`;

const confirmEmail = (link, name) => {
  const content = `
  <tr>
    <td style="box-sizing: border-box; padding: 20px;">
        <table role="presentation" border="0">
            <tr>
                <td>
                  <p>Hi ${name},</p>
                  <p>Thank you for signing up GIT Club. </p>
                  <p>To confirm your account, you need to click on the following button</p>
                </td>
            </tr>
            <tr>
                <td style="text-align: center">
                    ${buttonGenerate(link, 'Verify My Account')}
                </td>
            </tr>
            <tr>
                <td>
                    <p>This link will expire in seven (24) hours. If you don't manage to click on it in time, you'll need to sign up again.</p>
                </td>
            </tr>
        </table>
    </td>
  </tr>`;
  return template(content);
};

module.exports = { confirmEmail };
