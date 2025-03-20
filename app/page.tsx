'use client'

import { cn } from "@/lib/utils";

import { ThemeSwitcher } from "./components/ThemeSwitcher";
import {Input} from "@heroui/input";
import styles from "./page.module.css"
import logo from "@/public/SIX_Group_logo.svg"
import Image from "next/image";
import { Button } from "@heroui/button";
import { Card, CardBody, Code, Spinner } from "@heroui/react";
import { History, X } from "lucide-react"
import CardContainer from "./components/CardContainer";
import { useRef, useState } from "react";
import AudioRecorder from "./components/audio_recorder/audio_recorder";
import {ScrollShadow} from "@heroui/react";
import CandleChart from "./components/charts/CandleChart";
import LineChart from "./components/charts/LineChart";
import PieChart from "./components/charts/PieChart"
import { usePortfolioDataContext } from '@/context/portfolioData';
import UserSelector from "./components/user_selector/user_selector";
import TableChart from "./components/charts/TableCard";
import TableCard from "./components/charts/TableCard";
import NewsCard from "./components/charts/NewsCard";
import { code_font } from "@/lib/fonts"; // Adjust the import path


// chat can we get a pog chat?
type ChatHistory = {
  sender: "assistant" | "user",
  message: string
}[]

type ChartData = {
  x: Date,
  y: number | [number, number, number, number]
}

export default function Home() {
  const [selectedCards, setSelectedCards] = useState<string[]>([]) // id's of the selected cards
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [history, setHistory] = useState<ChatHistory>([]);

  const addCard = (cardId: string) => {
    if (!selectedCards.includes(cardId)) {
      setSelectedCards([... selectedCards, cardId])
      // console.log("added " + cardId)
    }
  }

  const removeCard = (cardId: string) => {
    setSelectedCards(selectedCards.filter(ele => ele !== cardId))
    // console.log("removed " + cardId)
  }

  // todo: add functionality to add selected cards and so on.
  const sendPrompt = (promptMessage: string) => {

    console.log(promptMessage)

    callOrchestrator(promptMessage);
    const currentHistory = history;
    currentHistory.push({
      message: promptMessage,
      sender: "user"
    });
    setInputValue("");
    setHistory([...currentHistory]);


  }
  const header = ["", "Valor Number", "Ticker symbol", "ISIN", "Instrument type", "Outstanding Securities", "Outstanding Capital", "Dividend policy", "Name", "Open", "Close", "High", "Low", "Vol"]
  const data = [
    ["Banco Santander Rg", "817651", "SAN", "ES0113900J37", "1 - 'Share, unit, particip. cert. in companies and cooperatives' (1)", "15152492322", "7576246161", "'Other payment frequency' (9)", "Banco Santander Rg", "6.5", "6.561", "6.595", "6.488", "31123749"],
  ]

  const userContext = usePortfolioDataContext();
  if (!userContext) {
      return null;
  }
  const {portfolioData, setPortfolioData} = userContext;



  const [messages, setMessages] = useState<string[]>([]);
  const [jsonData, setJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const callOrchestrator = async (promptMessage: string) => {
      setMessages([]);
      setJsonData(null);
      setLoading(true);

      const query = promptMessage;
      const portfolio = portfolioData;

      console.log(query, portfolio)

      try {
          const res = await fetch("/api/orchestrator", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query, portfolio }),
          });

          // Read the response as a stream
          const reader = res.body?.getReader();
          if (!reader) throw new Error("Failed to read response stream");

          const decoder = new TextDecoder();
          let newMessages: string[] = [];
          let fullText = "";

          while (true) {
              const { value, done } = await reader.read();
              if (done) break;

              // Decode the streamed text
              const chunk = decoder.decode(value, { stream: true });
              fullText += chunk; // Append to full response

              // Update UI with new message (excluding the final JSON)
              if (!chunk.startsWith("FINAL_JSON:")) {
                  newMessages = [...newMessages, chunk.trim()];
                  setMessages([...newMessages]);
              }
          }

          // Extract JSON data from the last message
          const jsonMatch = fullText.match(/FINAL_JSON:(\{.*\})/);
          if (jsonMatch) {
              const jsonData = JSON.parse(jsonMatch[1]);
              setJsonData(jsonData);
              console.log(jsonData);
              classify(jsonData);
          }

      } catch (error) {
          console.error("Error calling orchestrator:", error);
          setMessages(["Error communicating with the server."]);
      } finally {
          setLoading(false);
      }
  }

  const [charts, setCharts] = useState([]);

  function classify(jsonData: JSON) {

    // jsonData.list.foreach((rawData, i) => {
    //   switch(rawData.type) {
    //     case "LineChart":
    //       setCharts(...charts, )

    //   }
    // })


  }

  return <>
    <div className="h-screen w-screen flex">
      <aside className={
        cn(styles.history, "h-full flex flex-col bg-secondary-light dark:bg-secondary-dark", 
          "duration-500 ease-in-out transition-[transform,width]",
          "z-[999] absolute top-0 left-0 shadow-2xl lg:static",
          code_font.className,
          showHistory ? "w-[80%] lg:w-[30%] translate-x-0" : "w-[0] translate-x-[-400px]")
      }>
        <div className="flex p-5 justify-between items-center">
          <h2>Interaction Log</h2>
          <Button isIconOnly onPress={() => setShowHistory(!showHistory)}>
            <X />
          </Button>
        </div>
        <ScrollShadow hideScrollBar>
          <main className="w-full overflow-y-auto no-scrollbar">
            <div className="w-full flex flex-col p-5 justify-self-end">
              {
                history.map((message, idx) => {
                  return <div className={cn("p-1 w-fit w-max-[200px]")} key={idx}>
                    {message.sender + " wrote: " +message.message}
                  </div>
                })
              }
            </div>
          </main>
        </ScrollShadow>
      </aside>
      <div className="h-screen w-full flex flex-col">
        <header className="px-5 h-14 w-full flex items-center gap-5 justify-between">
          <div className="flex gap-5 items-center">
            <Image src={logo} alt="sixlogo" width={100} />
            <UserSelector className={"w-32"}></UserSelector>
          </div>
          <ThemeSwitcher />
        </header>
        <main className="flex flex-col h-full w-full justify-end">
          <div className="relative grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full h-full p-5 pb-[170px]">
            {charts.map((chart: any, index: number) => (
              <CardContainer
                key={index}
                id={`chart-${index}`}
                title={`Chart ${index + 1}`}
                content={
                  chart.type === "CandleChart" ? <CandleChart series={chart.data} /> :
                  chart.type === "LineChart" ? <LineChart series={chart.data} /> :
                  chart.type === "PieChart" ? <PieChart series={chart.data} /> : <div>No chart available</div>
                }
                onSelect={addCard}
                onDeselect={removeCard}
                colSpan={chart.colSpan || 1}
              />
            ))}

            <CardContainer id="1" title="card 1" content={<CandleChart/>} onSelect={addCard} onDeselect={removeCard} colSpan="2"/>
            <CardContainer id="2" title="card 2" content="This is card 2" onSelect={addCard} onDeselect={removeCard}/>
            <CardContainer id="3" title="card 3" content="This is card 3" onSelect={addCard} onDeselect={removeCard}/>
            <CardContainer id="4" title="card 4" content={<LineChart/>} onSelect={addCard} onDeselect={removeCard} colSpan="2"/>

            {/* <CardContainer id="1" title="card 1" content={<CandleChart/>} onSelect={addCard} onDeselect={removeCard} colSpan="2"/> */}
            <TableCard id="1" title="Banco Santander Rg" tableHeader={header} tableData={data} onSelect={addCard} onDeselect={removeCard} colSpan="2" rowSpan="2" toggleCellSelect={()=>{console.log("selected")}}></TableCard>
            {/* <CardContainer id="2" title="card 2" onSelect={addCard} onDeselect={removeCard} colSpan="2" rowSpan="2"/> */}
            <CardContainer id="3" title="The Pie is a lie" content={<PieChart />} onSelect={addCard} onDeselect={removeCard}/>
            <NewsCard id="2" 
              title="Local Hacker Wishes Yuki Was His Waifu" 
              content="Imagine being such a weeb. Unbelievable... Somebody should execute this person. Who could he be? This is literally the sister of the main character. Who told him he could be like this? Who hurt him? Find out more below."
              source="https://zhangrui.ch"
              onSelect={addCard}
              onDeselect={removeCard}
            />
            {/* <CardContainer id="4" title="card 4" content={<LineChart/>} onSelect={addCard} onDeselect={removeCard} colSpan="2"/> */}

            <div className="absolute bottom-0 left-0 w-full px-5">
              <Card className="w-full h-[150px] self-center bg-secondary-light dark:bg-secondary-dark">
                <CardBody>
                  <h2>AI Assistant: </h2>
                </CardBody>
              </Card>
            </div>
          </div>
          <form className="w-full self-center p-5 flex gap-3" onSubmit={(e) => {

            e.preventDefault();
            if (!inputValue) return;
            sendPrompt(inputValue);

          }}>
            <Button isIconOnly className="h-full" onPress={() => {
                console.log("toggling history: ");
                console.log(showHistory);
                setShowHistory(!showHistory);
              }}>
              <History className="cursor-pointer"/>
            </Button>
            
            <Input label="Prompt Your Assistant" type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}/>
            {
              loading ? 
              <div className="flex gap-5">
                <Spinner/>
                {messages.length > 0 ? <p>{messages[messages.length-1]}</p> : <></>}
              </div>
               :
              <Button color="primary" type="submit" className="h-full">
                Submit
              </Button>
            }
            <AudioRecorder onWhisperResponse={(res) => sendPrompt(res)}/>
          </form>
        </main> 
      </div>
    </div>
  </>
}

