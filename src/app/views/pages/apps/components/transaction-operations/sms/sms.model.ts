
export interface SMSDetail {
  id: string;
  phoneNumber: string;
  serviceId: string;
  accountNumber: string;
  email: string;
  endDate?: string;
  promotionId: string;
}

export interface BodyUdpateSMSServiceModel {
  id: string;
  customerId: string;
  inputter: string;
  coCode: string;
  coCodeT24: string;
  priority: string;
  campaignId?: string;
  saleType: string;
  saleId: string;
  brokerType: string;
  brokerId: string;
  actionT24: string;
  timeSlaInputter: string;
  timeUpdate: string;
  similarityCoreAi: any;
  smsDetail: SMSDetail[];
}

export interface BodyRequestSMSOldValue {
  id: string;
  customerId: string;
  inputter: string;
  coCode: string;
  coCodeT24: string;
  priority: string;
  campaignId?: string;
  saleType: string;
  saleId: string;
  brokerType: string;
  brokerId: string;
  actionT24: string;
  timeSlaInputter: string;
  timeUpdate: string;
  smsDetail: SMSDetail[];
}
