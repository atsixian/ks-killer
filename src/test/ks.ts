import { _SPKillSwitch } from '@microsoft/sp-core-library';

export function isTopicPickerRenderQosKSActivated(): boolean {
  return _SPKillSwitch.isActivated(
    'cc6daf8f-3d72-4c85-adea-cbb098663992'
    /* '08/13/2020', 'Sends QOS events for Topic Picker render.' */
  );
}
