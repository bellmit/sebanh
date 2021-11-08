import {createSelector} from '@ngrx/store';
import {AppState} from '../app.state';
import {ICoreAiUserImageModel} from '../../model/orc-card.model';

export const selectCoreAiUser = createSelector(
	(state: AppState) => state.coreAiUserImage,
	(coreAiUser: ICoreAiUserImageModel) => coreAiUser
);
