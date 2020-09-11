import { defaultText, teaText } from './attributionText';
import { bottomText, missionText } from './footerCopyrightText';
import { loginText } from './highlightsPopUpTexts';
import json from './messages.json';
import { bodyWithLink } from './modalErrorText';

export default {
  ...json,
  'i18n:attribution:default-text': defaultText,
  'i18n:attribution:tea-text': teaText,
  'i18n:error:boundary:body': bodyWithLink,
  'i18n:footer:copyright:bottom-text': bottomText,
  'i18n:footer:copyright:mission-text': missionText,
  'i18n:toolbar:highlights:popup:login-text': loginText,
};
