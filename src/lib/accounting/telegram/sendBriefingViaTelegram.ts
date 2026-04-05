import { env } from "@/env";
import { CaseUpdate } from "../sync";
import TelegramBot from "node-telegram-bot-api";

export async function sendTelegramBriefing(updates: CaseUpdate[]) {
  if (!env.TELEGRAM_TOKEN || !env.BRIEFING_THREAD_ID || !env.BRIEFING_CHAT_ID)
    return console.error(
      "telegram briefing isn't supported since env isn't properly configured",
    );

  if (updates.length == 0) {
    return console.log(
      "[telegram briefing] no briefing sent, since recieved no updates",
    );
  }

  const bot = new TelegramBot(env.TELEGRAM_TOKEN, { polling: false });

  await bot.sendMessage(env.BRIEFING_CHAT_ID, formBriefing(updates), {
    message_thread_id: +env.BRIEFING_THREAD_ID,
  });

  console.log("[telegram briefing] sent a brief");
}

function formBriefing(updates: CaseUpdate[]) {
  const briefs: string[] = [];

  updates.map((update) => {
    switch (update.state) {
      case "decision":
        briefs.push(
          `Отриманно рішення по справі ${update.caseNumber} ${update.plaintiffName}`,
        );
        break;
      case "ruling":
        briefs.push(
          `Отримано ухвалу по справі ${update.caseNumber} ${update.plaintiffName}`,
        );
        break;
      case "registration":
        briefs.push(
          `Зареєстровано справу ${update.caseNumber} треба надіслати метадату @svinka10`,
        );
        break;
    }
  });

  return briefs.join("\n------\n");
}
