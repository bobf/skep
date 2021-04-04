import React, { useState } from 'react';
import copyTextToClipboard from './copy';
import * as Icon from 'react-feather';
import $ from 'jquery';

import Modal from './modal';

const Networks = (props) => {
  const [showPopup, setShowPopup] = useState(false);
  const { serviceName, joinedNetworks, networkedServices } = props;
  const clickButton = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    setShowPopup(true);
  };

  if (showPopup) {
    $('.tooltip.fade').remove();
    const content = (
      <Content
        serviceName={serviceName}
        joinedNetworks={joinedNetworks}
        networkedServices={networkedServices}
      />
    );

    return (
      <Modal
        content={content}
        contentClass="networks"
        wrapperClass="networks-wrapper"
        title="Networks"
        subtitle={serviceName}
        closeCallback={() => setShowPopup(false)}
      />
    );
  }

  return (
      <button
        data-original-title={'View network information'}
        data-toggle={'tooltip'}
        data-html={'true'}
        className={`btn btn-info expand mapping networks`}
        onClick={(ev) => clickButton(ev)}>
        Networks
        <Icon.Eye className="icon" size="1.2em" />
      </button>
  );
};

const IntersectIcon = (props) => {
  const { network } = props;
  return (
    <span className="intersect-network-icon">
      <Icon.Activity data-toggle="tooltip" data-html="true" data-original-title=":)))" className="icon" size="1.2em" />
    </span>
  );
};

const Content = (props) => {
  const { serviceName, joinedNetworks, networkedServices } = props;

  const networks = joinedNetworks.map(network => {
    return (
      <div className="joined-network" key={`${serviceName}-${network.id}-joined`}>
        <span className="network-id">{network.id}</span> / <span className="network-name">{network.name}</span>
      </div>
    );
  });

  const rows = networkedServices.map(networkedService => {
    const { service, intersect } = networkedService;

    return (
      <tr key={`${serviceName}-networked-with-${service.name}`} className="networked-service">
        <td valign="top">
          <span className="networked-service">{service.name}</span>
        </td>
        <td>
          <table>
          <tbody>
            {intersect.map(
              network => (
                <tr key={`${serviceName}-reachable-${service.name}-${network.id}`}>
                  <td>
                    <div className="reachable-network-name">
                      {network.name}
                    </div>
                  </td>
                  <td>
                    {([service.name].concat(service.aliases[network.id] || [])).map(
                      (alias, index) => (
                        <span className="alias" key={`${serviceName}-reachable-${service.name}-${network.id}-${alias}`}>
                          {alias}
                          {index !== service.aliases[network.id].length ? <span className="syntax">, </span> : null}
                        </span>
                      )
                    )}
                  </td>
                </tr>
            ))}
          </tbody>
          </table>
        </td>
      </tr>
    );
  });

  return (
    <>
      <h2 className="joined">Joined Networks</h2>
      <div className="joined-networks">{networks}</div>
      <hr/>
      <h2 className="reachable">Reachable Services</h2>
      <table>
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Networks | <span className="aliases">Aliases</span></th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </>
  );
};

export default Networks;
