let tzOffset = new Date().getTimezoneOffset(),
    tzInput = document.getElementById('tzOffset');
tzInput.value = tzOffset*(-1)/60;

document.querySelector('#carouselBack').addEventListener('click', (event) => {
  const $slide = document.querySelector(event.target.getAttribute('href'));
  if (!$slide) return;

  if ($slide.scrollIntoViewIfNeeded) {
    event.preventDefault();
    $slide.scrollIntoViewIfNeeded();
  } else if ($slide.scrollIntoView) {
    event.preventDefault();
    $slide.scrollIntoView();
  }
});

document.querySelector('#carouselForward').addEventListener('click', (event) => {
  const $slide = document.querySelector(event.target.getAttribute('href'));
  if (!$slide) return;

  if ($slide.scrollIntoViewIfNeeded) {
    event.preventDefault();
    $slide.scrollIntoViewIfNeeded();
  } else if ($slide.scrollIntoView) {
    event.preventDefault();
    $slide.scrollIntoView();
  }
});

// goals = document.querySelectorAll('.simpleMain');
// goals.forEach( goal =>{
//   goal.addEventListener('click', (event) => {
//     const $slide = document.querySelector(event.target.getAttribute('href'));
//     if (!$slide) return;
//
//     if ($slide.scrollIntoViewIfNeeded) {
//       event.preventDefault();
//       $slide.scrollIntoViewIfNeeded();
//     } else if ($slide.scrollIntoView) {
//       event.preventDefault();
//       $slide.scrollIntoView();
//     }
//   });
// })
