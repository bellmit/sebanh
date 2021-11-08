import {createAction, props} from '@ngrx/store';
import {ICoreAiUserImageModel} from '../../model/orc-card.model';

export const updateUserImage = createAction('[USER IMAGE] Update User Image', props<ICoreAiUserImageModel>());
export const removeUserImage = createAction('[USER IMAGE] Remove User Image');
