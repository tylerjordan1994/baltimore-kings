import { SoccerBallLoader } from "@/components/soccer-ball-loader"

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <SoccerBallLoader size={96} showText />
    </div>
  )
}
