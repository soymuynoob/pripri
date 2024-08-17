import { DataBase } from '../../../../database';
import { TicketAttributes } from '../../models/ticket.model';
import { momentCustom } from '../../../../utils/moment';
import { ClientAttributes } from '../../../client/models/client.model';

export const createTicketService = async ({
  service_id,
  technical_id,
  hour,
  date,
  how_long,
  service_status_id,
  amount,
  status_payment_id,
  type_payment_id,
  status,
  created_by,
  description,
  gender_id,
  number_phone_1,
  full_name,
  address,
  home_appliances
}: TicketAttributes | any) => {
  try {
    let newClient:ClientAttributes | null = null
    const is_exist = await DataBase.instance.client.findOne({ where: { number_phone_1 } })
    if (!is_exist) {
       newClient = await DataBase.instance.client.create({
        gender_id,
        number_phone_1,
        full_name,
        created_date: momentCustom,
        created_by,
        address
      })

    }
    const newTicket = await DataBase.instance.ticket.create({
      client_id:is_exist?.id || newClient?.id,
      service_id: service_id,
      technical_id,
      hour,
      date,
      how_long,
      service_status_id,
      amount,
      status_payment_id,
      type_payment_id,
      status,
      created_date: momentCustom,
      created_by,
      description,
      home_appliances:home_appliances.toString()
    });
    return newTicket;
  } catch (err) {
    throw err;
  }
};
