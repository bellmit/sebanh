import {createSelector} from '@ngrx/store';
import {AppState} from '../app.state';
import {IOrcCardModel} from '../../model/orc-card.model';

export const selectOrcCard = createSelector(
	(state: AppState) => state.orcCardInfo,
	(orcCard: IOrcCardModel) => orcCard
);
