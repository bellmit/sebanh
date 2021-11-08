import {createAction, props} from '@ngrx/store';
import {IOrcCardModel} from '../../model/orc-card.model';

export const updateOrcCard = createAction('[ORC CARD] Update Orc Card', props<IOrcCardModel>());
export const removeOrcCard = createAction('[ORC CARD] Remove Orc Card');
