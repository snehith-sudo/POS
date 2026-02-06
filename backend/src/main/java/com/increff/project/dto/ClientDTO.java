package com.increff.project.dto;

import com.increff.project.model.data.ClientData;
import com.increff.project.useCase.ClientFlow;
import com.increff.project.model.form.ClientForm;
import com.increff.project.model.helpers.AbstractValidateNormalize;
import com.increff.project.model.helpers.PageSizeHelper;
import com.increff.project.entity.ClientPojo;
import com.increff.project.model.utils.ClientUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;
import static com.increff.project.model.utils.ClientUtil.clientDataConvert;
import static com.increff.project.model.helpers.ClientHelper.convertFormToEntity;

@Component
public class ClientDTO extends AbstractValidateNormalize {

    @Autowired
    private ClientFlow clientFlow;

    /* ---------------- CREATE ---------------- */

    public void addClient(ClientForm form)
    {
        validateNormalizeString(form.getName(),"Client Name");
        ClientPojo client = convertFormToEntity(form);
        clientFlow.addClient(client);
    }

    /* Find & Exist by Name */
    public ClientData findByName(ClientForm form)
    {
        validateNormalizeString(form.getName(),"Client Name");
        ClientPojo entity=  clientFlow.findByName(convertFormToEntity(form));
        return clientDataConvert(entity);
    }
    /* ---------------- READ ---------------- */

    public List<ClientData> getAllClients()
    {
        return clientFlow.getAll()
                .stream()
                .map(ClientUtil::clientDataConvert)
                .collect(Collectors.toList());
    }

    public List<ClientData> getAllClientsPaginated(PageSizeHelper form)
    {
        return clientFlow.getAllPaginated(form.getPage() , form.getSize())
                .stream()
                .map(ClientUtil::clientDataConvert)
                .collect(Collectors.toList());
    }

}
