const screens = {
  home: document.getElementById('home'),
  config: document.getElementById('config'),
  game: document.getElementById('game'),
  history: document.getElementById('history'),
  help: document.getElementById('help')
};

function showScreen(name){
  Object.values(screens).forEach(s=>s.classList.remove('active'));
  screens[name].classList.add('active');
}

document.getElementById('startBtn').addEventListener('click',()=>showScreen('config'));
document.getElementById('helpBtn').addEventListener('click',()=>screens.help.classList.remove('hidden'));
document.getElementById('closeHelp').addEventListener('click',()=>screens.help.classList.add('hidden'));

document.getElementById('closeHistory').addEventListener('click',()=>showScreen('game'));

document.getElementById('historyBtn').addEventListener('click',()=>{
  populateHistory();
  showScreen('history');
});

const easyBase = ['chat','chien','maison','chaise','soleil','pomme','livre','arbre','route','voiture','fleur','papier','guitare','nuage','fromage','ballon','ecole','lampe','fenetre','porte'];
const mediumBase = ['ordinateur','bouteille','campagne','energie','etoile','montagne','paysage','sport','musique','voyage','aventure','histoire','peinture','chanson','atelier','horloge','magazine','journal','banque','plante'];
const hardBase = ['parallelepipede','photosynthese','anticonstitutionnel','mythologie','catastrophe','archeologie','algorithme','astronomie','electromagnetisme','biodiversite'];

function expand(base,count){
  const arr=[]; for(let i=0;i<count;i++) arr.push(base[i%base.length]+(i+1)); return arr;
}

const words = {
  facile: expand(easyBase,200),
  moyen: expand(mediumBase,200),
  difficile: expand(hardBase,100)
};

let teams=[];
let currentTeam=0;
let timerInterval=null;
let remaining=0;
let currentWord='';
let history=[];

function pickWord(){
  const r=Math.random();
  let diff='facile';
  if(r>0.6) diff='moyen';
  if(r>0.85) diff='difficile';
  const arr=words[diff];
  const word=arr[Math.floor(Math.random()*arr.length)];
  currentWord=word;
  document.getElementById('wordDisplay').textContent=word;
  return diff;
}

function updateScores(){
  const scoresDiv=document.getElementById('scores');
  scoresDiv.innerHTML='';
  teams.forEach((t,i)=>{
    const div=document.createElement('div');
    div.className='score-item';
    div.textContent=`Equipe ${i+1}: ${t.score}`;
    scoresDiv.appendChild(div);
  });
}

function nextTeam(){
  currentTeam=(currentTeam+1)%teams.length;
  document.getElementById('currentTeam').textContent=`Equipe ${currentTeam+1}`;
}

function startTurn(){
  remaining=parseInt(document.getElementById('turnTime').value,10);
  document.getElementById('timer').textContent=remaining+'s';
  const diff=pickWord();
  timerInterval=setInterval(()=>{
    remaining--; document.getElementById('timer').textContent=remaining+'s';
    if(remaining<=0){ clearInterval(timerInterval); alert('Temps ecoule!'); nextTeam(); startTurn(); }
  },1000);
}

function saveHistory(team,diff,word,result){
  history.push({team,diff,word,result});
  localStorage.setItem('history',JSON.stringify(history));
}

function populateHistory(){
  const list=document.getElementById('historyList');
  list.innerHTML='';
  const fTeam=document.getElementById('filterTeam').value;
  const fDiff=document.getElementById('filterDifficulty').value;
  history.forEach(h=>{
    if((!fTeam || h.team==fTeam) && (!fDiff || h.diff==fDiff)){
      const li=document.createElement('li');
      li.textContent=`Equipe ${parseInt(h.team)+1} - ${h.word} (${h.diff}) : ${h.result}`;
      list.appendChild(li);
    }
  });
}

function initHistoryFilters(){
  const sel=document.getElementById('filterTeam');
  sel.innerHTML='<option value="">Toutes equipes</option>';
  teams.forEach((_,i)=>{
    const opt=document.createElement('option');
    opt.value=i; opt.textContent=`Equipe ${i+1}`; sel.appendChild(opt);
  });
}

document.getElementById('launchBtn').addEventListener('click',()=>{
  const teamCount=parseInt(document.getElementById('teamCount').value,10);
  teams=new Array(teamCount).fill(0).map(()=>({score:0}));
  currentTeam=0;
  updateScores();
  initHistoryFilters();
  document.getElementById('currentTeam').textContent=`Equipe 1`;
  showScreen('game');
  startTurn();
});

document.getElementById('successBtn').addEventListener('click',()=>{
  teams[currentTeam].score++; updateScores();
  saveHistory(currentTeam,pickWord(),currentWord,'reussi');
});

document.getElementById('failBtn').addEventListener('click',()=>{
  saveHistory(currentTeam,pickWord(),currentWord,'rate');
});

document.getElementById('pauseBtn').addEventListener('click',()=>{
  clearInterval(timerInterval);
  document.getElementById('pauseBtn').classList.add('hidden');
  document.getElementById('resumeBtn').classList.remove('hidden');
});

document.getElementById('resumeBtn').addEventListener('click',()=>{
  document.getElementById('pauseBtn').classList.remove('hidden');
  document.getElementById('resumeBtn').classList.add('hidden');
  timerInterval=setInterval(()=>{
    remaining--; document.getElementById('timer').textContent=remaining+'s';
    if(remaining<=0){ clearInterval(timerInterval); alert('Temps ecoule!'); nextTeam(); startTurn(); }
  },1000);
});

document.getElementById('resetBtn').addEventListener('click',()=>{
  if(confirm('Recommencer une nouvelle partie ?')) location.reload();
});

window.onload=()=>{
  const h=localStorage.getItem('history');
  if(h) history=JSON.parse(h);
};
