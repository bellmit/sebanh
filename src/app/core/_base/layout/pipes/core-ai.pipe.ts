import {Pipe, PipeTransform} from '@angular/core';
import {PROSPECT_KEY} from '../../../../shared/util/constant';
import {CoreAiService} from '../../../../views/pages/apps/components/identify-customer/service/core-ai.service';

@Pipe({
	name: 'coreAIPipe'
})
export class CoreAiPipe implements PipeTransform {

	// linkCardImage = CORE_AI_IMG_LINK;

	constructor(
		private coreAiService: CoreAiService
	) {
	}

	transform(value: any, ...args: any[]): any {
		switch (args[0]) {
			case 'userId': {
				// Nếu quét khuôn mặt
				// if (value.result && value.result.matched_users[0]) {
				// 	// Nếu là KH vãng lai
				// 	if (value.result.matched_users[0].user_id == PROSPECT_KEY) {
				// 		return value.result.matched_users[0].id;
				// 	}
				// 	return value.result.matched_users[0].user_id;
				// 	// Nếu quét GTTT và vân tay
				// } else if (value.user_id) {
				// 	return value.user_id;
				// } else if (value.customerID) {
				// 	return value.customerID;
				// }
				if (value.user_id) {
					if (value.user_id == PROSPECT_KEY) {
						return value.id;
					}
					return value.user_id;
				} else if (value.customerID) {
					return value.customerID;
				} else if(value.info.user_id) {
					if (value.info.user_id == PROSPECT_KEY) {
						return value.info.id;
					}
					return value.info.user_id;
				}
				return null;
			}

			case 'customerName': {
				if (value.metadata && value.metadata.card_name) {
					return value.metadata.card_name;
				} else if (value.shortName) {
					return value.shortName;
				}
				return null;
			}

			case 'generalImage': {
				if (value.info) {
					if (value.info.idcard && value.info.idcard.general_url) {
						return this.coreAiService.returnLinkGetImage(value.info.idcard.general_url);
					} else if(value.info.idcard && value.info.idcard.length > 0) {
						return this.coreAiService.returnLinkGetImage(value.info.idcard[0].general_url);
					}
				}

				// if (value.result && value.result.matched_users[0]
				// 	&& value.result.matched_users[0].general_url) {
				// 	// Nếu là KH vãng lai
				// 	if (value.result.matched_users[0].user_id == PROSPECT_KEY) {
				// 		return this.coreAiService.returnLinkGetImage(value.result.matched_users[0].general_url);
				// 	}
				// 	return this.coreAiService.returnLinkGetImage(value.result.matched_users[0].general_url);
				// 	// return this.coreAiService.returnLinkGetImage(value.info.faces[0].image_url);
				// 	// Nếu quét GTTT và vân tay
				// } else if (value.general_url) {
				// 	return this.coreAiService.returnLinkGetImage(value.general_url);//this.linkCardImage + value.general_url;
				// }
				return 'assets/media/logos/nodata.png';
			}

			case 'cardFrontImg': {

				if (value.info) {
					if (value.info.idcard && value.info.idcard.cropped_card_front_url) {
						return this.coreAiService.returnLinkGetImage(value.info.idcard.cropped_card_front_url);
					} else if(value.info.idcard && value.info.idcard.length > 0 &&  value.info.idcard[0].cropped_card_front_url) {
						return this.coreAiService.returnLinkGetImage(value.info.idcard[0].cropped_card_front_url);
					}
				}


				// if (value.result && value.result.matched_users[0]
				// 	&& value.result.matched_users[0].cropped_card_front_url) {
				// 	// Nếu là KH vãng lai
				// 	if (value.result.matched_users[0].user_id == PROSPECT_KEY) {
				// 		return this.coreAiService.returnLinkGetImage(value.result.matched_users[0].cropped_card_front_url);//this.linkCardImage + value.result.matched_users[0].cropped_card_front_url;
				// 	}
				// 	// return this.coreAiService.returnLinkGetImage(value.result.matched_users[0].cropped_card_front_url);//this.linkCardImage + value.result.matched_users[0].cropped_card_front_url;
				// 	return this.coreAiService.returnLinkGetImage(value.info.idcard.cropped_card_front_url);//this.linkCardImage + value.result.matched_users[0].cropped_card_front_url;
				// 	// Nếu quét GTTT và vân tay
				// } else if (value.cropped_card_front_url) {
				// 	return this.coreAiService.returnLinkGetImage(value.cropped_card_front_url);//this.linkCardImage + value.cropped_card_front_url;
				//
				// }
				return 'assets/media/logos/nodata.png';
			}

			case 'cardBackImg': {
				if (value.info) {
					if (value.info.idcard && value.info.idcard.cropped_card_back_url) {
						return this.coreAiService.returnLinkGetImage(value.info.idcard.cropped_card_back_url);
					} else if(value.info.idcard && value.info.idcard.length > 0 &&  value.info.idcard[0].cropped_card_back_url) {
						return this.coreAiService.returnLinkGetImage(value.info.idcard[0].cropped_card_back_url);
					}
				}


				// if (value.result && value.result.matched_users[0]
				// 	&& value.result.matched_users[0].cropped_card_back_url) {
				// 	// Nếu là KH vãng lai
				// 	if (value.result.matched_users[0].user_id == PROSPECT_KEY) {
				// 		return this.coreAiService.returnLinkGetImage(value.result.matched_users[0].cropped_card_back_url);//this.linkCardImage + value.result.matched_users[0].cropped_card_back_url;
				// 	}
				// 	// return this.coreAiService.returnLinkGetImage(value.result.matched_users[0].cropped_card_back_url);//this.linkCardImage + value.result.matched_users[0].cropped_card_back_url;
				// 	return this.coreAiService.returnLinkGetImage(value.info.idcard.cropped_card_back_url);//this.linkCardImage + value.result.matched_users[0].cropped_card_back_url;
				// 	// Nếu quét GTTT và vân tay
				// } else if (value.cropped_card_back_url) {
				// 	return this.coreAiService.returnLinkGetImage(value.cropped_card_back_url);//this.linkCardImage + value.cropped_card_back_url;
				//
				// }
				return 'assets/media/logos/nodata.png';
			}

			case 'channel': {
				// if (value.result && value.result.matched_users[0]
				// 	&& value.result.matched_users[0].metadata
				// 	&& value.result.matched_users[0].metadata.nextgen) {
				// 	// Nếu là KH vãng lai
				// 	if (value.result.matched_users[0].user_id == PROSPECT_KEY) {
				// 		return value.result.matched_users[0].metadata.nextgen.channel;
				// 	}
				// 	return value.result.matched_users[0].metadata.nextgen.channel;
				// 	// Nếu quét GTTT và vân tay
				// } else
				if (value.metadata && value.metadata.nextgen && value.metadata.nextgen.channel) {
					return value.metadata.nextgen.channel;
				}
				return null;
			}

			case 'legalDocName': {
				// if (value.result && value.result.matched_users[0]
				// 	&& value.result.matched_users[0].metadata
				// 	&& value.result.matched_users[0].metadata.card_front) {
				// 	// Nếu là KH vãng lai
				// 	if (value.result.matched_users[0].user_id == PROSPECT_KEY) {
				// 		return value.result.matched_users[0].metadata.card_front.class_name.value.split('-')[0];
				// 	}
				// 	return value.result.matched_users[0].metadata.card_front.class_name.value.split('-')[0];
				// 	// Nếu quét GTTT và vân tay
				// } else
				if (value.metadata && value.metadata.card_front) {
					return value.metadata.card_front.class_name.value.split('-')[0];

				} else if (value.legalDocName) {
					return value.legalDocName;
				}
				return null;
			}

			case 'legalId': {
				// if (value.result && value.result.matched_users[0]
				// 	&& value.result.matched_users[0].metadata
				// 	&& value.result.matched_users[0].metadata.card_front) {
				// 	// Nếu là KH vãng lai
				// 	if (value.result.matched_users[0].user_id == PROSPECT_KEY) {
				// 		return value.result.matched_users[0].metadata.card_front.id.value;
				// 	}
				// 	return value.result.matched_users[0].metadata.card_front.id.value;
				// 	// Nếu quét GTTT và vân tay
				// } else
				if (value.metadata && value.metadata.card_front) {
					return value.metadata.card_front.id.value;

				} else if (value.legalID) {
					return value.legalID;
				}
				return null;
			}

			case 'confidence': {
				// if (value.result && value.result.matched_users[0]
				// 	&& value.confidence) {
				// 	// Nếu là KH vãng lai
				// 	if (value.result.matched_users[0].user_id == PROSPECT_KEY) {
				// 		return value.confidence;
				// 	}
				// 	return value.confidence;
				// 	// Nếu quét GTTT và vân tay
				// } else
				if (value.similarity) {
					return value.similarity;
				}
				// if (value.metadata && value.metadata.card_front) {
				// 	return value.metadata.card_front.id.confidence;
				// }
				return null;
			}

			case 'email': {
				// if (value.result && value.result.matched_users[0]
				// 	&& value.result.matched_users[0].metadata
				// 	&& value.result.matched_users[0].metadata.nextgen) {
				// 	// Nếu là KH vãng lai
				// 	if (value.result.matched_users[0].user_id == PROSPECT_KEY) {
				// 		return value.result.matched_users[0].metadata.nextgen.email1;
				// 	}
				// 	return value.result.matched_users[0].metadata.nextgen.email1;
				// 	// Nếu quét GTTT và vân tay
				// } else
				if (value.metadata && value.metadata.nextgen
					&& value.metadata.nextgen.email1) {
					return value.metadata.nextgen.email1;
				} else if (value.email) {
					return value.email;
				}
				return null;
			}

			case 'phone': {
				// if (value.result && value.result.matched_users[0]
				// 	&& value.result.matched_users[0].metadata
				// 	&& value.result.matched_users[0].metadata.nextgen) {
				// 	// Nếu là KH vãng lai
				// 	if (value.result.matched_users[0].user_id == PROSPECT_KEY) {
				// 		return value.result.matched_users[0].metadata.nextgen.sms1;
				// 	}
				// 	return value.result.matched_users[0].metadata.nextgen.sms1;
				// 	// Nếu quét GTTT và vân tay
				// } else
				if (value.metadata && value.metadata.nextgen
					&& value.metadata.nextgen.sms1) {
					return value.metadata.nextgen.sms1;
				} else if (value.sms) {
					return value.sms;
				}
				return null;
			}

			case 'address': {
				// if (value.result && value.result.matched_users[0]
				// 	&& value.result.matched_users[0].metadata
				// 	&& value.result.matched_users[0].metadata.nextgen) {
				// 	// Nếu là KH vãng lai
				// 	if (value.result.matched_users[0].user_id == PROSPECT_KEY) {
				// 		return value.result.matched_users[0].metadata.nextgen.address;
				// 	}
				// 	return value.result.matched_users[0].metadata.nextgen.address;
				// 	// Nếu quét GTTT và vân tay
				// } else
				if (value.metadata && value.metadata.nextgen
					&& value.metadata.nextgen.address) {
					return value.metadata.nextgen.address;
				} else if (value.permanentAddress) {
					return value.permanentAddress;
				}
				return null;
			}

			case 'leftFinger':
				if (value.info && value.info.finger && value.info.finger.length) {
					return this.coreAiService.returnLinkGetImage(value.info.finger[0].image_url);
				}
				return 'assets/media/logos/nodata.png';

			case 'rightFinger':
				if (value.info && value.info.finger && value.info.finger.length) {
					return this.coreAiService.returnLinkGetImage(value.info.finger[1].image_url);
				}
				return 'assets/media/logos/nodata.png';

			case 'signature':
				if (value.info && value.info.signature && value.info.signature.length) {
					const signatures = value.info.signature.filter(sig => sig.image_url.includes('SIGNATURE_FULL'));
					if (signatures.length) {
						return this.coreAiService.returnLinkGetImage(this.getRawLink(signatures[args[1]].image_url));
					}
				}
				return 'assets/media/logos/nodata.png';
		}
	}

	getRawLink(link: string): string {
		if (!!link) {
			return link.substring(link.lastIndexOf('/signature/'), link.lastIndexOf('\?'));
		}
		return 'assets/media/logos/nodata.png';
	}
}
