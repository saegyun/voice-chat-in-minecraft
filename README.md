# Voice chat in minecraft
> 플레이어 거리에 따른 가변 볼륨 기능을 가진 통화 웹 어플리케이션

Livekit과 Express서버, Minecraft BE의 WebSocket연결을 이용한 Voice chat입니다. 사용법은 아래와 같습니다.

## Server
1. 프로젝트를 다운받는다. 
2. SSL인증서를 다운받아 `/ssl` 폴더 내에 위치시키다.
3. `npm i`, `npm run dev`를 순차적으로 실행시킨다.
4. 호스트 서버의 url을 크롬 등 브라우저를 이용해 접속한다. (Ex. `https://hostserver.url`)

## Client
1. 브라우저를 이용해 호스트 서버에 접속한다.
2. 이름 입력 창에 Minecraft닉네임을 입력한다.
3. 통화방을 만들고 접속한다.
4. Minecraft BE에서 `/connect (호스트서버주소)`를 채팅에 입력한다. (OP가 필요하다.)
5. `Connection Success`가 뜬다면 어플리케이션 내 옵션에서 Minecraft옵션을 On으로 바꾼다.

## Things to know
1. 본래 공개 목적이 아닌 개인 사용 목적의 프로젝트로 ssl, 호스트 서버 마련등 수반되어야할 작업이 있습니다.
2. Livekit을 사용하는 만큼 회원가입 및 토큰 키 발급 등이 선행되어야합니다. 발급한 토크는 .env를 만들어 넣어주시길 바랍니다.
