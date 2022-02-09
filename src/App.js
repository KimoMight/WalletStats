import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Navbar,
  Container,
  Nav,
  Row,
  Col,
  NavDropdown,
  Spinner,
  Button,
} from "react-bootstrap";
import connectors from "./connectors.ts";
import moralisConnector from "./moralisCon";
import { useWeb3React } from "@web3-react/core";
import React, { useState, useEffect, useRef } from "react";
import buttonImageDefault from "./assets/login-default.png";
import ComponentBar from "./components/ComponentBar";
import NegativeBarPlot from "./components/NegativeBarPlot";
import LineChartComponent from "./components/LineChartComponent";
import svgBackground from "./assets/background.svg";

function App() {
  const [userDomain, setUserDomain] = useState("");

  const [transactionArray, setTransactionArray] = useState([]);

  const [transactionsReady, setTransactionsReady] = useState(false);

  const [gasValues, setGasValues] = useState([]);

  const [timestamps, setTimestamps] = useState([]);

  const [transactionValues, setTransactionValues] = useState([]);

  const [balances, setBalances] = useState([]);

  const { active, account, activate, deactivate } = useWeb3React();

  function createConnectHandler(connectorId) {
    return async () => {
      try {
        const connector = connectors[connectorId];

        if (connector.walletConnectProvider?.wc?.uri) {
          connector.walletConnectProvider = undefined;
        }

        await activate(connector);
        const account = await connector.getAccount();

        setUserDomain(connector.uauth.store.storage["uauth-default-username"]);
        const userMoralisObject =
          await moralisConnector.moralisStartAndGetTransactions(account);
        const userTransactions = userMoralisObject.transactions;
        const userCurrentBalance = userMoralisObject.balance;
        setTransactionArray(userTransactions.result);
        computeGraphsData(
          userTransactions.result,
          account,
          userCurrentBalance.balance
        );
        setTransactionsReady(true);
      } catch (error) {
        console.error(error);
      }
    };
  }

  function computeGraphsData(transactionArray, account, currentBalance) {
    let balance = currentBalance / 10 ** 18;
    const today = new Date();
    balances.unshift({
      totalValue: Math.round(balance * 100) / 100,
      transactionDate: today.toLocaleString("en-GB", {
        timeZone: "UTC",
      }),
    });
    transactionArray.forEach((element, index) => {
      gasValues.unshift(element.gas_price / 10 ** 18);
      const milliseconds = Date.parse(element.block_timestamp);
      const dateObject = new Date(milliseconds);
      const readableDate = dateObject.toLocaleString("en-GB", {
        timeZone: "UTC",
      });
      timestamps.unshift(readableDate);
      computeTransactionValues(element, account, readableDate);
      balance = computeTotalPaidValues(element, balance, readableDate, account);
    });
    console.log(balances);
  }

  function computeTotalPaidValues(element, oldBalance, readableDate, account) {
    let transactionValue = element.value / 10 ** 18;
    let gasValue = element.gas_price / 10 ** 18;
    let newBalance = 0;
    if (account !== element.to_address) {
      newBalance = oldBalance + transactionValue + gasValue;
      balances.unshift({
        totalValue: Math.round(newBalance * 100) / 100,
        transactionDate: readableDate,
      });
    } else {
      newBalance = oldBalance - transactionValue;
      balances.unshift({
        totalValue: Math.round(newBalance * 100) / 100,
        transactionDate: readableDate,
      });
    }
    return newBalance;
  }

  function computeTransactionValues(element, account, readableDate) {
    let transactionValue = element.value;
    if (transactionValue == 0) {
      return;
    }
    if (account !== element.to_address)
      transactionValue = transactionValue * -1;
    transactionValues.unshift({
      transactionValue: transactionValue / 10 ** 18,
      transactionDate: readableDate,
    });
  }

  async function handleDisconnect() {
    try {
      console.log("logout");
      deactivate();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="App">
      {active && !transactionsReady && (
        <Spinner
          className="spinner-element"
          animation="border"
          variant="secondary"
        />
      )}
      {!active && (
        <div
          className="login-page"
          style={{ backgroundImage: `url(${svgBackground})` }}
        >
          <Container fluid>
            <Row>
              <Col lg="5">
                <div className="text-box-landing">
                  <p className="landing-heading">Wallet Stats</p>
                  <p className="landing-text">
                    The place where you can easily visualize and analyze your
                    wallet activity!
                  </p>
                </div>
              </Col>
              <Col lg="7">
                <div className="white-pop-up">
                  <p className="login-pop-text">
                    Please sign in to visualize your wallet stats!
                  </p>

                  <img
                    className="login-button login-ripple"
                    onClick={() => {
                      createConnectHandler(Object.keys(connectors)[2])();
                    }}
                    src={buttonImageDefault}
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      )}
      {active && transactionsReady && (
        <div classname="container-nav">
          <Navbar bg="dark" variant="dark">
            <Container fluid style={{ paddingLeft: "5%", paddingRight: "5%" }}>
              <Navbar.Brand href="#home">Wallet Stats</Navbar.Brand>
              <Navbar.Toggle />
              <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                  Welcome back : <a href="#login">{userDomain}</a>
                </Navbar.Text>
                <Navbar.Text className="btn-sign-out">
                  <Button
                    variant="warning"
                    onClick={() => {
                      handleDisconnect();
                    }}
                  >
                    Sign Out
                  </Button>
                </Navbar.Text>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          <Container
            fluid
            style={{
              paddingLeft: "5%",
              paddingRight: "5%",
              paddingTop: "30px",
            }}
          >
            <Row>
              <Col md="6">
                <h1>Gas spent on each transaction</h1>
                <ComponentBar dataX={timestamps} dataY={gasValues} />
              </Col>
              <Col md="6">
                <h1>Value of each transaction</h1>
                <NegativeBarPlot
                  dataX={transactionValues.map(
                    (element) => element.transactionDate
                  )}
                  dataY={transactionValues.map(
                    (element) => element.transactionValue
                  )}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <h1>Balance evolution</h1>
                <LineChartComponent
                  dataX={balances.map((element) => element.transactionDate)}
                  dataY={balances.map((element) => element.totalValue)}
                />
              </Col>
            </Row>
          </Container>
        </div>
      )}
    </div>
  );
}

export default App;
