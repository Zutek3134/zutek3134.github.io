const CONFIG={DICE:{MIN:1,MAX:9,FACES:6},SHUFFLE:{INTERVAL_MS:900,TRANSITION:"transform 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275)"},ROLL:{BASE_SPINS:3,DEGREES_PER_SPIN:360,RANDOM_TILT_RANGE:12,RANDOM_TILT_OFFSET:6,TIMING_MS:1500,TRANSITION:"transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)"},HISTORY:{LIMIT:3}},tray=q("#tray"),rollBtn=q("#rollBtn"),shuffleBtn=q("#shuffleBtn"),minusBtn=q("#minusBtn"),plusBtn=q("#plusBtn"),countDisplay=q("#countDisplay"),historyStrip=q("#historyStrip");let diceCount=CONFIG.DICE.MIN,historyEntries=[],diceRegistry=[],absoluteRollTurns=0,isCurrentlyShuffling=!1,shuffleIntervalId=null,shuffleStepCounter=0;const diceBlueprint=`
      <div class="shake-container">
        <div class="cube">
          <div class="core c-x"></div>
          <div class="core c-y"></div>
          <div class="core c-z"></div>

          <div class="face f-1"><div class="pip" style="grid-area: 2/2;"></div></div>
          <div class="face f-6">
            <div class="pip" style="grid-area: 1/1;"></div><div class="pip" style="grid-area: 1/3;"></div>
            <div class="pip" style="grid-area: 2/1;"></div><div class="pip" style="grid-area: 2/3;"></div>
            <div class="pip" style="grid-area: 3/1;"></div><div class="pip" style="grid-area: 3/3;"></div>
          </div>
          <div class="face f-2"><div class="pip" style="grid-area: 1/1;"></div><div class="pip" style="grid-area: 3/3;"></div></div>
          <div class="face f-5">
            <div class="pip" style="grid-area: 1/1;"></div><div class="pip" style="grid-area: 1/3;"></div>
            <div class="pip" style="grid-area: 2/2;"></div>
            <div class="pip" style="grid-area: 3/1;"></div><div class="pip" style="grid-area: 3/3;"></div>
          </div>
          <div class="face f-3"><div class="pip" style="grid-area: 1/1;"></div><div class="pip" style="grid-area: 2/2;"></div><div class="pip" style="grid-area: 3/3;"></div></div>
          <div class="face f-4">
            <div class="pip" style="grid-area: 1/1;"></div><div class="pip" style="grid-area: 1/3;"></div>
            <div class="pip" style="grid-area: 3/1;"></div><div class="pip" style="grid-area: 3/3;"></div>
          </div>
        </div>
      </div>
    `,targetAxesMappings={1:{x:0,y:0},2:{x:0,y:-90},3:{x:-90,y:0},4:{x:90,y:0},5:{x:0,y:90},6:{x:180,y:0}};function updateTrayLayout(){tray.innerHTML="",diceRegistry=[],countDisplay.textContent=`${diceCount}`,plusBtn.classList.toggle("disabled",diceCount>=CONFIG.DICE.MAX),minusBtn.classList.toggle("disabled",diceCount<=CONFIG.DICE.MIN);for(let t=0;t<diceCount;t++){const e=document.createElement("div");e.className="scene",e.innerHTML=diceBlueprint,tray.appendChild(e);const s=e.querySelector(".cube");s.style.transition=CONFIG.ROLL.TRANSITION,diceRegistry.push({cubeInstance:s})}isCurrentlyShuffling&&engageShuffleState(!0)}function runElasticShowcaseStep(){shuffleStepCounter++,diceRegistry.forEach((t,e)=>{const s=(shuffleStepCounter+e)%CONFIG.DICE.FACES+1,i=targetAxesMappings[s];t.cubeInstance.style.transform=`rotateX(${i.x}deg) rotateY(${i.y}deg) rotateZ(0deg)`})}function engageShuffleState(t=!1){isCurrentlyShuffling=t,shuffleIntervalId&&(clearInterval(shuffleIntervalId),shuffleIntervalId=null),isCurrentlyShuffling&&(diceRegistry.forEach(e=>{e.cubeInstance.style.transition=CONFIG.SHUFFLE.TRANSITION}),runElasticShowcaseStep(),shuffleIntervalId=setInterval(runElasticShowcaseStep,CONFIG.SHUFFLE.INTERVAL_MS))}function executeFinalRoll(){rollBtn.disabled=!0,minusBtn.disabled=!0,plusBtn.disabled=!0,isCurrentlyShuffling&&window.Toggle.set(shuffleBtn,!1),diceRegistry.forEach(e=>{e.cubeInstance.style.transition=CONFIG.ROLL.TRANSITION}),rollSequenceCount=++absoluteRollTurns;let t=[];requestAnimationFrame(()=>{diceRegistry.forEach((e,s)=>{const i=Math.floor(Math.random()*CONFIG.DICE.FACES)+1;t.push(i);const a=targetAxesMappings[i],d=Math.random()*CONFIG.ROLL.RANDOM_TILT_RANGE-CONFIG.ROLL.RANDOM_TILT_OFFSET,n=Math.random()*CONFIG.ROLL.RANDOM_TILT_RANGE-CONFIG.ROLL.RANDOM_TILT_OFFSET,c=Math.random()*(CONFIG.ROLL.RANDOM_TILT_RANGE+2)-(CONFIG.ROLL.RANDOM_TILT_OFFSET+1),l=rollSequenceCount*CONFIG.ROLL.BASE_SPINS*CONFIG.ROLL.DEGREES_PER_SPIN,r=l+a.x+d,o=l+a.y+n,v=c;e.cubeInstance.style.transform=`rotateX(${r}deg) rotateY(${o}deg) rotateZ(${v}deg)`})}),setTimeout(()=>{const e=t.reduce((s,i)=>s+i,0);appendHistoryLedger(e),rollBtn.disabled=!1,minusBtn.disabled=!1,plusBtn.disabled=!1},CONFIG.ROLL.TIMING_MS)}function appendHistoryLedger(t){historyEntries.unshift(t),historyEntries.length>CONFIG.HISTORY.LIMIT&&(historyEntries.pop(),historyStrip.lastElementChild.remove());const e=document.createElement("span");e.className="history-item",e.innerHTML=historyEntries[0],historyStrip.prepend(e)}shuffleBtn.addEventListener("toggle:change",t=>engageShuffleState(t.detail.checked)),rollBtn.addEventListener("click",executeFinalRoll),minusBtn.addEventListener("click",()=>{diceCount>CONFIG.DICE.MIN&&(diceCount--,updateTrayLayout())}),plusBtn.addEventListener("click",()=>{diceCount<CONFIG.DICE.MAX&&(diceCount++,updateTrayLayout())}),updateTrayLayout(),shuffleBtn.click();
