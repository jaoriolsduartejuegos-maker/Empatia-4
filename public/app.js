let tabs = [{ id: Date.now(), title: "Ejercicio 1", prompt: "", exercise: "", solution: "" }];
let activeId = tabs[0].id;

const tabsEl = document.getElementById('tabs');
const promptInput = document.getElementById('promptInput');
const exerciseEl = document.getElementById('exercise');
const solutionEl = document.getElementById('solution');

// Render pestañas
function renderTabs() {
  tabsEl.innerHTML = '';
  tabs.forEach(t => {
    const tab = document.createElement('div');
    tab.className = 'tab' + (t.id === activeId ? ' active' : '');
    tab.textContent = t.title;
    tab.onclick = () => { activeId = t.id; loadActiveTab(); renderTabs(); };
    tabsEl.appendChild(tab);
  });
}

function loadActiveTab() {
  const tab = tabs.find(t => t.id === activeId);
  if (!tab) return;
  promptInput.value = tab.prompt;
  exerciseEl.value = tab.exercise;
  solutionEl.value = tab.solution;
}

document.getElementById('newTab').onclick = () => {
  const newTab = { id: Date.now(), title: `Ejercicio ${tabs.length + 1}`, prompt: "", exercise: "", solution: "" };
  tabs.push(newTab);
  activeId = newTab.id;
  renderTabs();
  loadActiveTab();
};

promptInput.oninput = (e) => {
  const tab = tabs.find(t => t.id === activeId);
  if (tab) tab.prompt = e.target.value;
};

exerciseEl.oninput = (e) => {
  const tab = tabs.find(t => t.id === activeId);
  if (tab) tab.exercise = e.target.value;
};

solutionEl.oninput = (e) => {
  const tab = tabs.find(t => t.id === activeId);
  if (tab) tab.solution = e.target.value;
};

// Llamada a Gemini vía función serverless
async function callGemini(type, text) {
  const prompt = `${type === "crear" ? "Crea un ejercicio:" : "Resuelve paso a paso:"} ${text}`;

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();

  if (data.error) {
    return "⚠️ Error: " + data.error;
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No se obtuvo respuesta.";
}

document.getElementById('btnGenerate').onclick = async () => {
  const tab = tabs.find(t => t.id === activeId);
  if (!tab) return;
  tab.exercise = await callGemini("crear", promptInput.value);
  loadActiveTab();
};

document.getElementById('btnSolve').onclick = async () => {
  const tab = tabs.find(t => t.id === activeId);
  if (!tab) return;
  tab.solution = await callGemini("resolver", exerciseEl.value);
  loadActiveTab();
};

document.getElementById('btnSave').onclick = () => {
  const tab = tabs.find(t => t.id === activeId);
  if (!tab) return;
  const content = `# ${tab.title}\n\n## Enunciado\n${tab.exercise}\n\n## Solución paso a paso\n${tab.solution}`;
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${tab.title.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// Inicializar
renderTabs();
loadActiveTab();
