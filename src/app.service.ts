import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): any {
    return { message: "Hello from iptv server!" };
  }
}
