document.querySelector('#status').addEventListener('change', (event) =>{
  const status = document.querySelector('#status')
  const target = document.querySelector('#inputDayOfWeek')
  const target2 = document.querySelector('#inputDate')

  if( status.value == 'weekly'){
    target.style = 'display: flex;'
    target2.style = 'display: none;'
  }
  if( status.value !== 'weekly'){
    target.style = 'display: none;'
    target2.style = 'display: block;'
  }
  console.log( status, target, target2, event)
})
