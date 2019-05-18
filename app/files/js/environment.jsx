function Environment(props) {
  const { environment, name } = props;
  const colCount = 2;
  const rowCount = Math.ceil(Object.keys(environment).length / colCount);
  const env = [];
  let count = 0;

  for (let i = 0; i < rowCount; i++) {
    env.push([]);
  }

  if (!env.length) {
    return null;
  }

  for (const [key, value] of Object.entries(environment)) {
    env[count % rowCount].push(
      <td
        className={'keypair'}
        key={`env-${name}-${key}`}>
        <span className={'key'}>{key}</span>
        <span className={'syntax'}>{'='}</span>
        <span className={'value'}>{value}</span>
      </td>
    );
    count++;
  }

  return (
    <div className={'environment'}>
      <table>
        <tbody>
          {env.map(
            (keypairs, index) => (
              <tr key={`env-${name}-${index}`}>
                {keypairs}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Environment;
