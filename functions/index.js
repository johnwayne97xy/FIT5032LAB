// functions/index.js
// Firebase Cloud Function to send emails using SendGrid

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const { GoogleGenerativeAI } = require('@google/generative-ai');


admin.initializeApp();

// 设置 SendGrid API Key (需要在 Firebase 配置中设置)
// firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
sgMail.setApiKey(functions.config().sendgrid.key);

// 监听 email_queue 集合的新文档
exports.sendAssessmentEmail = functions.firestore
  .document('email_queue/{emailId}')
  .onCreate(async (snap, context) => {
    const emailData = snap.data();

    // 构建邮件内容
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .score-box { background: #f0fdf4; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
          .score-number { font-size: 48px; font-weight: bold; color: ${getScoreColor(emailData.score)}; }
          .level-badge { display: inline-block; background: ${getScoreColor(emailData.score)}; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
          .tips { background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin: 10px; }
          .support-links { background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Mental Health Assessment Results</h1>
          </div>

          <div class="content">
            <div class="score-box">
              <div class="score-number">${emailData.score}/100</div>
              <div class="level-badge">${emailData.level}</div>
            </div>

            <h2>${emailData.message.title}</h2>
            <p>${emailData.message.text}</p>

            <div class="tips">
              <h3>💪 Steps You Can Take Today:</h3>
              <ul>
                <li>Take a 10-minute walk outside for fresh air and movement</li>
                <li>Practice deep breathing exercises</li>
                <li>Connect with someone you trust</li>
                <li>Write down three things you're grateful for</li>
              </ul>
            </div>

            <div class="support-links">
              <h3>🤝 Support Resources:</h3>
              <p><strong>Lifeline:</strong> 13 11 14 (24/7 Crisis Support)</p>
              <p><strong>Beyond Blue:</strong> 1300 22 4636</p>
              <p><strong>Headspace:</strong> For young people aged 12-25</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${functions.config().app.url}/community-stories" class="button">
                Share Your Story
              </a>
              <a href="${functions.config().app.url}/resources" class="button">
                Find Help Near You
              </a>
            </div>

            <div class="footer">
              <p><em>This assessment is for educational purposes only and not a clinical diagnosis.
              If you're experiencing distress, please consult with a healthcare professional.</em></p>
              <p>© 2024 Women's Mental Health Platform</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // 构建纯文本版本
    const emailText = `
Your Mental Health Assessment Results

Score: ${emailData.score}/100
Level: ${emailData.level}

${emailData.message.title}

${emailData.message.text}

Steps You Can Take Today:
- Take a 10-minute walk outside
- Practice deep breathing exercises
- Connect with someone you trust
- Write down three things you're grateful for

Support Resources:
- Lifeline: 13 11 14
- Beyond Blue: 1300 22 4636
- Headspace: For young people aged 12-25

Visit our platform for more resources and support.

This assessment is for educational purposes only and not a clinical diagnosis.
    `;

    const msg = {
      to: emailData.to,
      from: functions.config().sendgrid.from || 'noreply@mentalhealthplatform.com',
      subject: emailData.subject,
      text: emailText,
      html: emailHtml
    };

    try {
      await sgMail.send(msg);

      // 更新文档状态为已发送
      await admin.firestore()
        .collection('email_queue')
        .doc(context.params.emailId)
        .update({
          status: 'sent',
          sentAt: admin.firestore.FieldValue.serverTimestamp()
        });

      console.log('Email sent successfully to:', emailData.to);
      return { success: true };

    } catch (error) {
      console.error('Error sending email:', error);

      // 更新文档状态为失败
      await admin.firestore()
        .collection('email_queue')
        .doc(context.params.emailId)
        .update({
          status: 'failed',
          error: error.message,
          failedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      return { success: false, error: error.message };
    }
  });

// 辅助函数：根据分数获取颜色
function getScoreColor(score) {
  if (score < 20) return '#dc2626';
  if (score < 40) return '#f97316';
  if (score < 60) return '#eab308';
  if (score < 80) return '#10b981';
  return '#059669';
}


// ======================
// 2️⃣ Gemini AI 功能
// ======================

const GEMINI_KEY = functions.config().gemini.key;
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

// ✅ 支持 CORS 的 Gemini HTTP 函数
exports.askGemini = functions.https.onRequest(async (req, res) => {
  // ✅ 添加跨域支持
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // 预检请求（OPTIONS）直接返回
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  try {
    const userPrompt = req.body.prompt || 'Hello';

    // 构建更好的系统提示词，限制回复长度
    const systemPrompt = `
You are a helpful and empathetic mental health support assistant.
IMPORTANT RULES:
1. Be warm, supportive, and understanding
2. Use simple, clear language
3. If the user seems distressed, acknowledge their feelings first

User message: ${userPrompt}

Your brief response:
    `.trim();

    // 配置 Gemini 模型，设置更严格的参数
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite'

    });

    // 生成响应
    const result = await model.generateContent(systemPrompt);
    let responseText = result.response.text();

    // 额外的长度检查和清理
    // 1. 移除多余的空白和换行
    responseText = responseText.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ');


    // 返回响应
    res.status(200).json({
      output: responseText,
      success: true
    });

  } catch (error) {
    console.error('❌ Gemini error:', error);

    // 返回友好的错误消息
    res.status(500).json({
      output: "I'm sorry, I'm having trouble responding right now. Please try again.",
      error: error.message,
      success: false
    });
  }
});
