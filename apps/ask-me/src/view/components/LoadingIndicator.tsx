import { FC } from "hono/jsx";
import { Card } from "./Card";

export const LoadingIndicator: FC = () => {
  return (
    <div className="flex gap-3 justify-start">
      <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
        <i className="fas fa-robot text-sm"></i>
      </div>
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            <div className="size-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div
              className="size-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="size-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <span className="text-sm text-gray-500">AI 正在思考中...</span>
        </div>
      </Card>
    </div>
  );
};
