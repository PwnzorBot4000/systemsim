// Game API shared directly with user land programs

export class CommonApi {
  cls = () => {};
  getArgv = (index = 0, defaultValue = '') => '';
  getArgvInt = (index = 0, defaultValue = 0) => 0;
  getSwitch = (short = '', long = '', defaultValue = false) => false;
  print = (text = '') => {};
}