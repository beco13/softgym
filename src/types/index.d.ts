
// esto se crea para poder asignar la informacion del usuario logueado en la peticion del socket
// https://socket.io/how-to/use-with-express-session#with-typescript
declare module "http" {
    interface IncomingMessage {
        user: UserIdentity
    }
}
