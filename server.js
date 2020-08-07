const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

const config = require("./config.json");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("첫 페이지 응답값");
});

// 빌링키 발급
app.post("/subscribe/key", async (req, res) => {
  const {
    cardNum: card_number,
    expiry,
    birth,
    pwd2Digit: pwd_2digit,
    customer_uid,
  } = req.body;

  try {
    const getToken = await axios.post("https://api.iamport.kr/users/getToken", {
      imp_key: config.REST_KEY, // REST API키
      imp_secret: config.REST_SECRET, // REST API Secret
    });

    const { access_token } = getToken.data.response;

    // console.group("getToken");
    // console.log(access_token);
    // console.groupEnd("getToken");

    const issueBilling = await axios.post(
      `https://api.iamport.kr/subscribe/customers/${customer_uid}`,
      {
        card_number,
        expiry,
        birth,
        pwd_2digit,
      },
      { headers: { Authorization: access_token } } // 인증 토큰 Authorization header에 추가
    );

    const { code, message } = issueBilling.data;

    // console.group("issueBilling");
    // console.log(code, message);
    // console.groupEnd("issueBilling");

    if (code === 0) {
      // 빌링키 발급 성공
      res.send({
        status: "success",
        message: `Billing has successfully issued, check customer_uid, ${customer_uid}`,
      });
    } else {
      // 빌링키 발급 실패
      res.send({ status: "failed", message });
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

const port = 3002;

app.listen(port, () => {
  console.log(`node.js server run at localhost:${port}`);
});
