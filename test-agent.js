const http = require('http');

async function testAgent() {
  console.log("Creating project...");
  const projectRes = await fetch("http://localhost:3000/api/projects", { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Verification Test" })
  });
  const project = await projectRes.json();
  console.log("Created project:", project);

  console.log("Creating conversation...");
  const convRes = await fetch(`http://localhost:3000/api/conversations`, { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId: project.id, title: "Test Conversation", model: "deepseek-v4-pro" })
  });
  const conv = await convRes.json();
  console.log("Created conversation:", conv);

  console.log("Sending message to AI agent...");
  return new Promise((resolve, reject) => {
    const req = http.request("http://localhost:3000/api/conversations/" + conv.id + "/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        const str = chunk.toString();
        data += str;
        process.stdout.write("."); // show progress
      });
      res.on("end", () => {
        console.log("\n\nStream finished!");
        resolve(data);
      });
    });

    req.on("error", reject);
    req.write(JSON.stringify({ content: "Build a simple counter app with React. Output only a single markdown code block." }));
    req.end();
  });
}

testAgent().then((data) => {
  console.log("SUCCESS. Final bytes received:", data.length);
  process.exit(0);
}).catch(err => {
  console.error("FAILED", err);
  process.exit(1);
});
