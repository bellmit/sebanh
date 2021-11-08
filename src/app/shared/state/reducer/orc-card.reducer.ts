import {createReducer, on} from '@ngrx/store';
import {updateOrcCard, removeOrcCard} from '../action/orc-card.action';
import {IOrcCardModel} from '../../model/orc-card.model';

export const initialState: IOrcCardModel = null;

const _orcCardReducer = createReducer(
	initialState,
	on(updateOrcCard, (state, orcCardInfo: IOrcCardModel) => ({
		...state,
		gender: orcCardInfo.gender,
		birthDate: orcCardInfo.birthDate,
		fullNameEn: orcCardInfo.fullNameEn,
		fullNameVn: orcCardInfo.fullNameVn,
		ho_khau: orcCardInfo.ho_khau,
		issueAddress: orcCardInfo.issueAddress,
		issueDate: orcCardInfo.issueDate,
		legalId: orcCardInfo.legalId,
		legalType: orcCardInfo.legalType,
		ngay_het_han: orcCardInfo.ngay_het_han,
		hoKhau: orcCardInfo.hoKhau
	})),
	on(removeOrcCard, (state) => null)
);

export function orcCardReducer(state, action) {
	return _orcCardReducer(state, action);
}
