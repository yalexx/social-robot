import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from '../../../../../../core/animations';
import { ChatService } from '../../chat.service';

@Component({
    selector   : 'fuse-chat-right-sidenav',
    templateUrl: './right.component.html',
    styleUrls  : ['./right.component.scss'],
    animations : fuseAnimations
})
export class FuseChatRightSidenavComponent implements OnInit
{
    view: string;

    constructor(private chatService: ChatService)
    {
        this.view = 'contact';
    }

    ngOnInit()
    {
        this.chatService.onRightSidenavViewChanged.subscribe(view => {
            this.view = view;
        });
    }

}
