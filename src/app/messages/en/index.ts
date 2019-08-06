import attributionText from './attributionText';
import { bottomText, missionText } from './footerCopyrightText';
import json from './messages.json';

export default {
  ...json,
  'i18n:attribution:text': attributionText,
  'i18n:footer:copyright:bottom-text': bottomText,
  'i18n:footer:copyright:mission-text': missionText,
};
