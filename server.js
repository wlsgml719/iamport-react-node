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

    console.group("getToken");
    console.log(access_token);
    console.log(customer_uid);
    console.groupEnd("getToken");

    const issueBilling = await axios.post(
      `https://api.iamport.kr/subscribe/customers/${customer_uid}`,
      {
        card_number,
        expiry,
        birth,
        pwd_2digit,
      },
      { headers: { Authorization: `Bearer ${access_token}` } } // 인증 토큰 Authorization header에 추가
    );

    const { code, message } = issueBilling.data;

    console.group("issueBilling");
    console.log(code, message);
    console.groupEnd("issueBilling");

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

// 빌링키 발급 후 결제
app.post("/subscribe/payments/schedule", async (req, res) => {
  //   const {
  //     product: { amount, name },
  //     email,
  //     password,
  //   } = req.body;
  //   const verify = { email: "wlsgml719@naver.com", password: 123456 };

  // connection
  // 넘어온 유저정보(간편비밀번호)를 통해 유저검증(암호화)
  // 넘어온 값을 암호화 하여 DB 간편비밀번호와 대조
  // customer_uid 조회

  // 넘어온 상품정보와
  // merchant_uid 생성
  // customer_uid를 통해 결제요청

  //   let merchant_uid;
  //   let customer_uid;

  //   if (email === verify.email && password === verify.password) {
  //     customer_uid = "taehong_0001_1234"; // 빌링키 발급받은 카드
  //     merchant_uid = "ether123card"; // ??? 가맹점 거래 고유번호 - 카드사_카드뒷번호_처리일
  //   }

  const customer_uid = "taehong_0001_1234";
  const merchant_uid = "ether123card";
  const amount = "10000";
  const name = "쿠키맛";

  try {
    const getToken = await axios.post("https://api.iamport.kr/users/getToken", {
      imp_key: config.REST_KEY, // REST API키
      imp_secret: config.REST_SECRET, // REST API Secret
    });

    const { access_token } = getToken.data.response;

    const paymentResult = await axios.post(
      "https://api.iamport.kr/subscribe/payments/again",
      {
        customer_uid,
        merchant_uid,
        amount,
      },
      {
        headers: {
          Authorization: access_token,
        },
      }
    );

    const { code, message } = paymentResult.data;

    if (code === 0) {
      // 카드사 통신에 성공(실제 승인 성공 여부는 추가 판단이 필요합니다.)
      if (paymentResult.status === "paid") {
        //카드 정상 승인
        res.send({
          status: "success",
          message: message,
        });
      } else {
        //카드 승인 실패 (ex. 고객 카드 한도초과, 거래정지카드, 잔액부족 등)
        //paymentResult.status : failed 로 수신됩니다.
        res.send({
          status: "failed",
          message: message,
        });
      }
      //   res.send("api 추가 설정 필요");
    } else {
      // 카드사 요청에 실패 (paymentResult is null)
      res.send({
        status: "deny",
        message: message,
      });
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

const port = 3002;
app.listen(port, () => {
  console.log(`node.js server run at localhost:${port}`);
});
