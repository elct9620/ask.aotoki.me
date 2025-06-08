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
            <div className="size-2 bg-green-500 rounded-full mr-2"></div>
            線上
          </Badge>
        </div>
      </div>
    </div>
  );
};
