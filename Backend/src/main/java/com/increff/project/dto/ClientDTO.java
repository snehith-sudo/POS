package com.increff.project.dto;

import com.increff.project.model.data.ClientData;
import com.increff.project.useCase.ClientUseCase;
import com.increff.project.model.form.ClientForm;
import com.increff.project.entity.ClientPojo;
import com.increff.project.utils.helpers.AbstractValidateNormalize;
import com.increff.project.model.form.PageSizeForm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import static com.increff.project.utils.utils.ClientUtil.clientDataConvert;
import static com.increff.project.utils.helpers.ClientHelper.convertFormToEntity;
import com.increff.project.utils.utils.ClientUtil;

@Component
public class ClientDTO extends AbstractValidateNormalize {

    @Autowired
    private ClientUseCase clientUseCase;


    public void addClient(ClientForm form) {

        NormalizeValidateClient(form);
        ClientPojo client = convertFormToEntity(form);
        clientUseCase.addClient(client);
    }

    public List<ClientData> findClientByName(ClientForm form) {

        form.setName(NormalizeValidateString(form.getName(), "Client Name"));
        ClientPojo entity = clientUseCase.getCheckClientByName(convertFormToEntity(form));

        if (entity == null) {
            return Collections.emptyList(); // ✅ consistent
        }
        return List.of(clientDataConvert(entity));
    }

    public Page<ClientData> getAllOrders(PageSizeForm form) {

        Page<ClientPojo> pojoPage = clientUseCase.getAllPagedClients(form.getPage(), form.getSize());

        List<ClientData> dataList = pojoPage.getContent()
                .stream()
                .map(ClientUtil::clientDataConvert)
                .collect(Collectors.toList());

        return new PageImpl<>(
                dataList,
                pojoPage.getPageable(),
                pojoPage.getTotalElements()
        );
    }

    public void NormalizeValidateClient(ClientForm form) {
        form.setName(NormalizeValidateString(form.getName(),"Client Name"));
    }

}
