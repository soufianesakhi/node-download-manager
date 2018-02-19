import { Request, Response, Router } from 'express';
import { UsersDAO, UserModel } from '../dao/users-dao';

export class UsersAPI {
    constructor(private router: Router) { }

    init(path: string) {
        this.router.get(path, this.getAll);
        this.router.post(path, this.post);
    }

    getAll(req: Request, res: Response) {
        UsersDAO.find({}, (err: Error, users: UserModel[]) => {
            if (err) {
                res.send('Error: ' + err.message);
                console.error(err);
            } else {
                res.send(users);
            }
        });
    }

    post(req: Request, res: Response) {
        new UsersDAO(req.body).save((err: Error) => {
            if (err) {
                res.send('User invalid: ' + err.message);
                console.error(err.message);
            } else {
                res.send('User saved');
            }
        });
    }
}
