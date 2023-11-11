export async function sendTrialReq(data: any, source: string) {
  const nameModUrl =
    "https://eme-log-82bd27c4e828.herokuapp.com/name-moderation";
  const picModUrl =
    "https://eme-log-82bd27c4e828.herokuapp.com/xpicture-moderation";
  const url = source === "name" ? nameModUrl : picModUrl;

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });
  const dataJson = await response.json();
  console.log("dataJson", dataJson);
}
