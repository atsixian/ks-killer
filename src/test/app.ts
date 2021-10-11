import { isTestKSActivated } from './ks';

function app() {
  if (isTestKSActivated()) {
    console.log('app inside');
  }
}

app();
