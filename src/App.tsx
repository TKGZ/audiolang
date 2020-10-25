import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import hanzi from "hanzi";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

import { useSpeechSynthesis } from 'react-speech-kit';



enum Modes {
  QUESTION = "Question",
  CORRECT = "Correct",
  INCORRECT = "Incorrect",
  WAIT = "Wait",
  FEEDBACK = "feedback",
}

enum Types {
  RECOGNITION = "recognition",
  PRODUCTION = "production"
}

const INTERVAL = 2 * 1000
const SWITCH = 3;
const Q_INTERVAL = 4
const A_INTERVAL = 4
const F_INTERVAL = 4;



function App() {
  const [mode, setMode] = useState(Modes.WAIT);
  const [count, setCount] = useState(1);
  const [question, setQuestion] = useState(hanzi.getCharacterInFrequencyListByPosition(111).character);
  const [answer, setAnswer] = useState(hanzi.getCharacterInFrequencyListByPosition(111).meaning);
  const [possibleAnswers, setPossibleAnswers] = useState([])
  const [current, setCurrent] = useState(hanzi.getCharacterInFrequencyListByPosition(111));
  const [type, setType] = useState(Types.RECOGNITION)
  const [isCorrect, setIsCorrect] = useState(false)


  const { transcript, resetTranscript } = useSpeechRecognition()

  const { speak, voices } = useSpeechSynthesis();

  //logic for a specific mode
  useEffect(() => {
    if (mode === Modes.QUESTION) {
      const next = getNext()
      setCurrent(next)


    }
    else if (mode === Modes.CORRECT) {
      SpeechRecognition.stopListening()
      sayCorrect()
    }
    else if (mode === Modes.INCORRECT) {
      SpeechRecognition.stopListening()
      sayIncorrect(answer, type)
    }
  }, [mode])


  useEffect(() => {
    hanzi.start()
    setCurrent(getNext)
  }, [])

  useEffect(() => {
    let newQuestion = ""
    let newAnswer = ""
    let newType = Types.RECOGNITION
    if (Math.random() > 0.5) {
      //english to chinese
      newQuestion = (current.character)
      newAnswer = (current.meaning)

      newType = (Types.RECOGNITION)
    }
    else {
      //chinese to english
      newQuestion = (current.meaning)
      newAnswer = (current.character)
      // setPossibleAnswers([current.character])
      newType = (Types.PRODUCTION)
    }
    if (current.meaning) {
      const possibles = current.meaning.replace(',', '/').split("/")
      setPossibleAnswers(possibles)
      console.log("possibles are ", possibles)
    }

    setQuestion(newQuestion)
    setAnswer(newAnswer)
    setType(newType)


    if (mode !== Modes.WAIT) {
      if (newType === Types.RECOGNITION) {
        speak({ text: "What's a meaning of " + newQuestion, voice: voices.filter((v: any) => (v.lang === "zh-CN"))[0] })
        SpeechRecognition.startListening({ continuous: true })
      }
      else {
        speak({ text: "What's the translation of " + newQuestion })
        SpeechRecognition.startListening({ continuous: true, language: 'zh-CN' })
      }
    }
  }, [current])

  //check if correct
  useEffect(() => {
    if (mode === Modes.QUESTION) {
      // if (transcript.contains(answer))
      if (possibleAnswers) {
        possibleAnswers.forEach((a: any) => {
          if (transcript.includes(a))
            setIsCorrect(true)
        })
      }
    }
  }, [transcript])

  //on type you change the languages accorginly

  const getNext = () => {
    const n = Math.floor(Math.random() * 1500);
    // console.log(hanzi.getCharacterFrequency('热'))
    return (hanzi.getCharacterInFrequencyListByPosition(n))
  }

  useInterval(() => {
    console.log("interval", count)
    setCount(count + 1)
    if (count === SWITCH) {

      if (mode === Modes.QUESTION) {
        setCount(0)
        if (isCorrect) {
          setMode(Modes.CORRECT)
        }
        else {
          setMode(Modes.INCORRECT)
        }
        setIsCorrect(false)
      }
      else {
        // setCount(-1)
        setCount(-2)
        setIsCorrect(false)
        setMode(Modes.QUESTION)
        resetTranscript()
      }
    }

  }, INTERVAL)

  const sayQuestion = () => {

  }

  const sayCorrect = () => {
    speak({ text: "Correct!" })
  }

  const sayIncorrect = (should: string, type: Types) => {
    console.log("incorrect")
    if (type === Types.PRODUCTION) {
      speak({ text: "Incorrect. Correct answer is: " + should, voice: voices.filter((v: any) => (v.lang === "zh-CN"))[0] })

    }
    else {
      speak({ text: "Incorrect. Correct answer is: " + should })

    }
  }

  return (
    <>
      {

        (mode === Modes.WAIT) ? <div className="App"> Loading... </div> :
          <div className="App">
            {/* <p>
              {mode}
            </p> */}
            <p>
              {mode === Modes.CORRECT && "Correct!"}
            </p>
            <p>
              {question && question} = ?
            </p>
            <p>
              {answer && (mode === Modes.CORRECT || mode === Modes.INCORRECT) && "Correct answer is " + answer}
            </p>
            {/* <button onClick={() => { SpeechRecognition.startListening() }}>Start</button> */}
            {/* <button onClick={SpeechRecognition.stopListening}>Stop</button> */}
            {/* <button onClick={() => sayCorrect()}>Correct</button> */}
            {/* <button onClick={() => sayWrong(answer)}>Incorrect</button> */}
            {/* <button onClick={() => speak({ text: "我不知道", voice: voices.filter((v: any) => (v.lang === "zh-CN"))[0] })}>Speak</button> */}
            <p>{transcript}</p>
          </div >
      }
    </>
  );
}

export default App;

const r = () => { };

function useInterval(
  callback: () => void,
  delay: number | null | false,
  immediate?: boolean
) {
  const savedCallback = useRef(r);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  });

  // Execute callback if immediate is set.
  useEffect(() => {
    if (!immediate) return;
    if (delay === null || delay === false) return;
    savedCallback.current();
  }, [immediate]);

  // Set up the interval.
  useEffect(() => {
    if (delay === null || delay === false) return undefined;
    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}

export const timeToSeconds = (time: number): number => {
  return ((time - (time % 1000)) / 1000);
}