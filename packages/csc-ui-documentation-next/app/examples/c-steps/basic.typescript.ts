let step = 1;

const steps = document.querySelector('c-steps')!;

const [previous, next] = document.querySelectorAll('c-button');

const update = () => {
  steps.value = step;
  previous!.disabled = step === 1;
  next!.disabled = step === 5;
};

previous!.addEventListener('click', () => {
  step--;
  update();
});

next!.addEventListener('click', () => {
  step++;
  update();
});
