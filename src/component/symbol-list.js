import React, { useEffect, useState } from 'react';
import { ListGroup, ListGroupItem } from 'shards-react';
import SecurityListService from "../services/security-list-service";
import '../styles/symbol-list.css';

export default function SymbolList({ selectedSymbols, service, securityList, onSecurityItemSelected }) {
    const [ securityListService, setSecurityListService ] = useState(null);

    function handleSelect(securityItem) {
        onSecurityItemSelected(securityItem);
    }

    useEffect(() => {
        securityListService && securityListService.getSecurityListDefinitions();
    }, [securityListService]);

    useEffect(() => {
      !securityListService && setSecurityListService(new SecurityListService(service));

    }, [securityListService, service]);

    return (
        <div className="symbol-list">
            <h4>Currencies shown</h4>
            <ListGroup className="symbol-list--selected">
                {
                    securityList && securityList.filter(securityItem => selectedSymbols && selectedSymbols.includes(securityItem.SecurityID)).map(securityItem =>
                    <ListGroupItem className="symbol-list-item-selected" key={securityItem.SecurityID} onClick={() => handleSelect(securityItem)}>
                        {securityItem.Symbol}
                    </ListGroupItem>)
                }
            </ListGroup>
            <h4>Select currencies</h4>
            <ListGroup className="symbol-list--not-selected">
                {
                    securityList && securityList.filter(securityItem => selectedSymbols && !selectedSymbols.includes(securityItem.SecurityID)).map(securityItem =>
                        <ListGroupItem key={securityItem.SecurityID} onClick={() => handleSelect(securityItem)}>
                            {securityItem.Symbol}
                        </ListGroupItem>)
                }
            </ListGroup>
        </div>
    )
}
