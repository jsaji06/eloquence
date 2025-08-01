document.querySelector(".editor")?.addEventListener("click", (e: Event) => {
      const target = e.target as HTMLElement
      if (target.tagName === "MARK") {
        let highlightedContent = target.textContent!;
        console.log(highlightedContent, normalize(highlightedContent))
        if(props.feedbackPanel === false){
          dataRef.current.map((data, _) => {
            if(data){
            data.points.map((point, _) => {
              point.active = true
              return point
            })
            return data
          }
          })
          
          let subsection = dataRef.current.filter(response => {
            if(response){
            response.points.some(point => {
            
            return point.highlighted_text.some(text => {
              let normedHigh = normalize(text)
              let normedCont = normalize(highlightedContent)
              return normedHigh === normedCont || text === highlightedContent || text.includes(highlightedContent);
            });
          })
        }
      })

        
        
    
          if (!subsection) return;
          let newData = dataRef.current.map((data, _) => {
            let newDataInfo = { ...data }
            if (data === subsection[0]) {
              newDataInfo.collapsed = true;
              let newPoints = newDataInfo.points.map((point, _) => ({
                ...point,
                active: point.highlighted_text.some(text => normalize(text) === normalize(highlightedContent) || text === highlightedContent || text.includes(highlightedContent))
              }))
              newDataInfo.points = newPoints;
          } else {
            newDataInfo.collapsed = false;
          }
          return newDataInfo
        })
        if (newData) props.setAiData(newData);
      } else {
        let feedback = feedbackRef.current.filter(back => back.point.highlighted_text.some((text:string) => normalize(text) === normalize(highlightedContent) || text === highlightedContent || text.includes(highlightedContent)))
        if (!feedback) return;
        let newFeedback = [...feedbackRef.current]

        for(let i  = 0; i < newFeedback.length; i++){
          if(newFeedback[i] === feedback[0]){
            newFeedback[i].collapsed = true;
          } 
    // else newFeedback[i].collapsed = false;
    //     }
    //     props.setFeedback(newFeedback);
        
    //   }
    // })

})