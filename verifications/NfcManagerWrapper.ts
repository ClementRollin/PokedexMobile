import NfcManager, {NfcEvents} from 'react-native-nfc-manager';

export const startNfc = async () => {
    try {
      await NfcManager.start();
      console.log('NfcManager started successfully');
    } catch (err) {
      console.warn('Failed to start NfcManager', err);
    }
};

export const registerTagEvent = () => {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: any) => {
      console.log('tag', tag);
      NfcManager.setAlertMessageIOS('I got your tag!');
    });
  
    NfcManager.registerTagEvent().catch(err => {
      console.warn('registerTagEvent fail', err);
    });
};

export const unregisterTagEvent = () => {
  NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
  NfcManager.unregisterTagEvent().catch(() => 0);
};