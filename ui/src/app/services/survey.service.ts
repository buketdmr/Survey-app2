import { Injectable } from '@angular/core';
import { HttpClient, HttpUrlEncodingCodec, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs-compat/add/operator/map';
import { environment } from '../../environments/environment';


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
    })
};

@Injectable()
export class SurveyService {
    private workSpaceReportURL = `${environment.apiUrl}/surveys/`;
    constructor(private http: HttpClient) { }
    public guid: string;
    getSections(px): Observable<any> {
        return this.http.get(this.workSpaceReportURL + 'get-sections/' + this.guid + '/' + px);
    }

    checkGuid(guid): Observable<any> {
        return this.http.get(this.workSpaceReportURL + 'check-guid/' + guid);
    }

    checkGuidNgsId(guid, gsId): Observable<any> {
        return this.http.get(`${this.workSpaceReportURL}check-guid/${guid}/${gsId}`);
    }

    sendEmail(groupSurveyId: number) {
        return this.http.post(`${this.workSpaceReportURL}send-email/${this.guid}/${groupSurveyId}`,
            JSON.stringify({
            }),
            httpOptions
        );
    }


    getSurveys(): Observable<any> {
        return this.http.get(`${this.workSpaceReportURL}get-surveys/${this.guid}`);
    }

    getQuestions(sectionId: number, px: boolean): Observable<any> {
        return this.http.get(`${this.workSpaceReportURL}get-questions/${this.guid}/${sectionId}/${(px ? 1 : 0)}`);
    }

    getAnswers(groupSurveyId: number, sectionId: number, px: boolean): Observable<any> {
        return this.http.get(`${this.workSpaceReportURL}get-answers/${this.guid}/${groupSurveyId}/${sectionId}/${(px ? 1 : 0)}`);
    }

    save(groupSurveyId: number, sectionId: number, px: boolean, data: any): Observable<any> {
        return this.http.post(`${this.workSpaceReportURL}save/${this.guid}/${groupSurveyId}/${sectionId}/${(px ? 1 : 0)}`,
            JSON.stringify(data),
            httpOptions
        );
    }
}
