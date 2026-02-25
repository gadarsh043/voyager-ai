"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Play, RotateCcw, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const GRID_SIZE = 20
const INITIAL_SPEED = 150
const SPEED_INCREMENT = 2

type Point = { x: number; y: number }
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"

const INITIAL_SNAKE: Point[] = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
]
const INITIAL_DIRECTION: Direction = "UP"

interface SnakeGameProps {
    destination?: string
}

export function SnakeGame({ destination }: SnakeGameProps) {
    const defaultDest = destination && destination.trim() ? destination.trim() : "This"
    const targetSentence = `${defaultDest} is a very beautiful place.`

    // We want to form the sentence letter by letter.
    // Spaces don't need to be collected, we can just reveal them automatically,
    // but for simplicity let's make the user collect ALL characters (including spaces)
    // or skip spaces. Let's skip spaces so they only eat letters.
    const lettersToCollect = useMemo(() => {
        return targetSentence.split('').map((char, index) => ({ char, index }))
            .filter(item => item.char !== ' ')
    }, [targetSentence])

    const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE)
    const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION)
    const [food, setFood] = useState<Point>({ x: 5, y: 5 })

    // Progress through the letters
    const [collectedCount, setCollectedCount] = useState(0)

    const [isPlaying, setIsPlaying] = useState(false)
    const [isGameOver, setIsGameOver] = useState(false)
    const [score, setScore] = useState(0)
    const [highScore, setHighScore] = useState(0)
    const [speed, setSpeed] = useState(INITIAL_SPEED)

    // Determine the current letter the player needs to eat
    const currentTargetIndex = collectedCount % lettersToCollect.length
    const currentTargetLetter = lettersToCollect[currentTargetIndex].char

    // Calculate the sentence progress to display
    // We construct the sentence based on `collectedCount`
    const displayedSentenceChars = []
    let pointer = 0
    for (let i = 0; i < targetSentence.length; i++) {
        if (targetSentence[i] === ' ') {
            displayedSentenceChars.push(' ')
        } else {
            if (pointer < collectedCount) {
                displayedSentenceChars.push(targetSentence[i])
            } else {
                displayedSentenceChars.push('_')
            }
            pointer++
        }
    }
    const displayedSentence = displayedSentenceChars.join('')

    const directionRef = useRef(direction)
    const isPlayingRef = useRef(isPlaying)

    useEffect(() => {
        directionRef.current = direction
    }, [direction])

    useEffect(() => {
        isPlayingRef.current = isPlaying
    }, [isPlaying])

    const generateFood = useCallback((currentSnake: Point[]) => {
        let newFood: Point
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            }
            const isOnSnake = currentSnake.some(
                (segment) => segment.x === newFood.x && segment.y === newFood.y
            )
            if (!isOnSnake) break
        }
        return newFood
    }, [])

    const resetGame = () => {
        setSnake(INITIAL_SNAKE)
        setDirection(INITIAL_DIRECTION)
        setFood(generateFood(INITIAL_SNAKE))
        setIsGameOver(false)
        setScore(0)
        setCollectedCount(0)
        setSpeed(INITIAL_SPEED)
        setIsPlaying(true)
    }

    const handleKeyPress = useCallback((e: KeyboardEvent) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault()
        }

        if (!isPlayingRef.current) return

        switch (e.key) {
            case "ArrowUp":
            case "w":
                if (directionRef.current !== "DOWN") setDirection("UP")
                break
            case "ArrowDown":
            case "s":
                if (directionRef.current !== "UP") setDirection("DOWN")
                break
            case "ArrowLeft":
            case "a":
                if (directionRef.current !== "RIGHT") setDirection("LEFT")
                break
            case "ArrowRight":
            case "d":
                if (directionRef.current !== "LEFT") setDirection("RIGHT")
                break
        }
    }, [])

    useEffect(() => {
        window.addEventListener("keydown", handleKeyPress)
        return () => window.removeEventListener("keydown", handleKeyPress)
    }, [handleKeyPress])

    useEffect(() => {
        if (!isPlaying || isGameOver) return

        const moveSnake = () => {
            setSnake((prevSnake) => {
                const head = prevSnake[0]
                const newHead = { ...head }

                switch (directionRef.current) {
                    case "UP": newHead.y -= 1; break
                    case "DOWN": newHead.y += 1; break
                    case "LEFT": newHead.x -= 1; break
                    case "RIGHT": newHead.x += 1; break
                }

                if (
                    newHead.x < 0 ||
                    newHead.x >= GRID_SIZE ||
                    newHead.y < 0 ||
                    newHead.y >= GRID_SIZE
                ) {
                    setIsGameOver(true)
                    setIsPlaying(false)
                    return prevSnake
                }

                if (
                    prevSnake.some(
                        (segment) => segment.x === newHead.x && segment.y === newHead.y
                    )
                ) {
                    setIsGameOver(true)
                    setIsPlaying(false)
                    return prevSnake
                }

                const newSnake = [newHead, ...prevSnake]

                if (newHead.x === food.x && newHead.y === food.y) {
                    setScore((s) => {
                        const newScore = s + 10
                        setHighScore((h) => Math.max(h, newScore))
                        return newScore
                    })
                    setCollectedCount((c) => c + 1)
                    setSpeed((s) => Math.max(50, s - SPEED_INCREMENT))
                    setFood(generateFood(newSnake))
                } else {
                    newSnake.pop()
                }

                return newSnake
            })
        }

        const intervalId = setInterval(moveSnake, speed)
        return () => clearInterval(intervalId)
    }, [isPlaying, isGameOver, food, generateFood, speed])

    const cells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
        const x = i % GRID_SIZE
        const y = Math.floor(i / GRID_SIZE)
        return { x, y }
    })

    const handleDirectionClick = (dir: Direction) => {
        if (!isPlaying) return
        if (dir === "UP" && directionRef.current !== "DOWN") setDirection("UP")
        if (dir === "DOWN" && directionRef.current !== "UP") setDirection("DOWN")
        if (dir === "LEFT" && directionRef.current !== "RIGHT") setDirection("LEFT")
        if (dir === "RIGHT" && directionRef.current !== "LEFT") setDirection("RIGHT")
    }

    return (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 p-4 sm:p-6 w-full max-w-7xl mx-auto">

            {/* Left side text/score */}
            <div className="flex flex-col items-center lg:items-start max-w-md shrink-0 text-center lg:text-left">
                <h2 className="text-xl md:text-3xl font-bold text-foreground mb-4 leading-tight">We are preparing your itinerary, stay tuned...</h2>
                <p className="mb-8 text-sm md:text-base text-muted-foreground">
                    Play a quick game of Snake while our AI does the heavy lifting! Collect the letters to build your sentence.
                </p>

                <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-xl border border-border flex flex-col items-center lg:items-start gap-4 mb-6">
                    <div className="flex items-center gap-6 w-full justify-between">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <span className="font-bold text-base md:text-lg text-foreground">{highScore}</span>
                        </div>
                        <div className="text-sm md:text-base font-semibold text-muted-foreground">
                            Score: <span className="text-foreground">{score}</span>
                        </div>
                    </div>
                </div>

                <div className="text-center lg:text-left w-full">
                    <p className="text-xs uppercase tracking-wider text-primary font-bold mb-2">Message Progress</p>
                    <p className="font-mono text-lg md:text-xl font-medium tracking-[0.15em] text-foreground leading-relaxed break-words whitespace-pre-wrap">
                        {displayedSentence}
                    </p>
                </div>
            </div>

            {/* Right side game board */}
            <div className="flex flex-col items-center w-full lg:max-w-[550px]">
                <div
                    className="relative bg-zinc-100 dark:bg-black rounded-lg overflow-hidden border border-border/50 shadow-inner w-full aspect-square"
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                    }}
                >
                    {cells.map((cell) => {
                        const isSnakeHead = snake[0].x === cell.x && snake[0].y === cell.y
                        const isSnakeBody = snake.some((s, i) => i !== 0 && s.x === cell.x && s.y === cell.y)
                        const isFood = food.x === cell.x && food.y === cell.y

                        return (
                            <div
                                key={`${cell.x}-${cell.y}`}
                                className={cn(
                                    "w-full h-full flex items-center justify-center font-bold text-[0.6rem] sm:text-[0.7rem] md:text-sm lg:text-base",
                                    isSnakeHead && "bg-primary rounded-sm shadow-sm z-10",
                                    isSnakeBody && "bg-primary/80 rounded-sm",
                                    isFood && "bg-rose-500 text-white rounded-sm drop-shadow-[0_0_8px_rgba(225,29,72,0.8)] scale-110 z-20"
                                )}
                            >
                                {isFood && currentTargetLetter}
                            </div>
                        )
                    })}

                    {(!isPlaying && !isGameOver) && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center z-30">
                            <Button onClick={resetGame} size="lg" className="rounded-full shadow-lg gap-2 px-8">
                                <Play className="w-5 h-5" fill="currentColor" />
                                Play
                            </Button>
                        </div>
                    )}

                    {isGameOver && (
                        <div className="absolute inset-0 bg-background/90 backdrop-blur-[4px] flex flex-col items-center justify-center p-4 z-30">
                            <h3 className="text-3xl font-extrabold text-foreground mb-1">Game Over</h3>
                            <p className="text-lg font-medium text-muted-foreground mb-6">Final Score: {score}</p>
                            <Button onClick={resetGame} variant="default" className="rounded-full gap-2 px-8">
                                <RotateCcw className="w-4 h-4" />
                                Play Again
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobile controls */}
                <div className="grid grid-cols-3 gap-2 mt-6 lg:hidden w-[220px]">
                    <div />
                    <Button variant="secondary" size="icon" className="h-14 w-14 rounded-xl" onClick={() => handleDirectionClick("UP")}>↑</Button>
                    <div />
                    <Button variant="secondary" size="icon" className="h-14 w-14 rounded-xl" onClick={() => handleDirectionClick("LEFT")}>←</Button>
                    <Button variant="secondary" size="icon" className="h-14 w-14 rounded-xl" onClick={() => handleDirectionClick("DOWN")}>↓</Button>
                    <Button variant="secondary" size="icon" className="h-14 w-14 rounded-xl" onClick={() => handleDirectionClick("RIGHT")}>→</Button>
                </div>

                <p className="mt-6 text-xs text-muted-foreground text-center hidden lg:block">
                    Use <kbd className="px-1.5 py-0.5 border rounded-md">W</kbd> <kbd className="px-1.5 py-0.5 border rounded-md">A</kbd> <kbd className="px-1.5 py-0.5 border rounded-md">S</kbd> <kbd className="px-1.5 py-0.5 border rounded-md">D</kbd> or arrow keys to play
                </p>
            </div>
        </div>
    )
}
