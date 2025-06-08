import { FC } from "hono/jsx";
import { Badge } from "./Badge";

export const ChatHeader: FC = () => {
  return (
    <div className="border-b border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">@ask.aotoki.me</h1>
          <p className="text-gray-600">隨時為您解析蒼時弦也的觀點</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <div className="relative flex size-2 mr-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex size-2 rounded-full bg-green-500"></span>
            </div>
            線上
          </Badge>
        </div>
      </div>
    </div>
  );
};
