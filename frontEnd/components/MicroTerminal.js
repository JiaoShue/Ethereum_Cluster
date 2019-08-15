import React from 'react';
import AnsiUp from 'ansi_up';

export const MicroTerminal = props => {
  const ansiup = new AnsiUp();
  return (
    <div className={'terminal_container'}>
      <div className={'terminal_body'}>
        <ul>
          {props.msgList.map((m, index) => {
            if (!m || typeof m !== 'string') {
              m = '';
            }
            m =  m.indexOf('[no_ansi]') > -1 ? m.split('[no_ansi]')[1] : ansiup.ansi_to_html(m);
            if (index < props.msgList.length - 1) {
              m = `${[new Date().toLocaleString()]}\t${m}`;
              return (
                <li
                  dangerouslySetInnerHTML={{ __html: m }}
                />
              );
            } else {
              return (
                <li
                  dangerouslySetInnerHTML={{
                    __html: '>\t' + m,
                  }}
                />
              );
            }
          })}
        </ul>
      </div>
      <style jsx>{`
          .terminal_container {
            border-radius: 5px;
          }
          .terminal_body {
            padding: 10px;
            border-radius: 5px;
            background-color: black;
            color: #f0f0f0;
            height: 350px;
            width: 100%;
            overflow-y: scroll;
          }
          ul {
            padding-left: 10px;
          }
          li {
            list-style: none;
            font-family: 'PT mono', 'Consolas';
          }
        `}
      </style>
      <style jsx global>{`
        body {
          background-color: '#bebebe'
        }
      `}
      </style>
    </div>
  );
};
