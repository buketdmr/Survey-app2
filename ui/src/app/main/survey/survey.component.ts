import { Component, OnInit, OnDestroy, Input, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SurveyService } from 'app/services/survey.service';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';
import { forEach } from 'lodash';

export interface ImageContent {
    src: '';
}

@Component({
    selector: 'dialogdata',
    templateUrl: 'dialogdata.html',
})
export class DialogDataExampleDialog {
    constructor(@Inject(MAT_DIALOG_DATA) public data: ImageContent) { }
}

@Component({
    selector: 'app-survey',
    templateUrl: './survey.component.html',
    styleUrls: ['./survey.component.scss'],
})
export class SurveyComponent implements OnInit {
    id: number;
    derivedSiteType: string;
    sections: any[];
    completed: boolean[];
    selectedSection: any;
    powerX: boolean = false;
    answers: any;
    questions: any[];
    dependentQuestions: any;
    answerOptions: any;
    questionSets: any[];
    indices = [0, 1];
    email: string;
    depAnswers: any;
    intermediate: boolean = false;
    imageSrc: string;

    showSurvey: boolean = false;
    showNotFound: boolean = false;
    isEditable: boolean = true;
    gsId: number;

    constructor(
        private surveyService: SurveyService,
        public dialog: MatDialog,
        private matSnackBar: MatSnackBar,
        private route: ActivatedRoute
    ) {

    }

    getQuestion(id) {
        if (id !== null) return this.questions.filter((q) => q.id == id)[0];
        return null;
    }

    getColor(section) {
        if (section.name === this.selectedSection.name) {
            return 'font-size:9px;color:lime';
        } else {
            return 'font-size:9px;color:white';
        }
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            let surveyGuid = params.get("guid");
            let paramGsId = params.get("gsId");
            if (paramGsId == 'new') {
                this.gsId = -1;
            } else {
                this.gsId = parseInt(paramGsId);
            }
            this.surveyService.checkGuidNgsId(surveyGuid, this.gsId).subscribe((data) => {
                this.surveyService.guid = surveyGuid;
                this.showSurvey = true;
                this.showNotFound = false;
                this.setupSections();
            }, (err) => {
                this.surveyService.guid = null;
                this.showSurvey = false;
                this.showNotFound = true;
            });


        })
    }

    setupSections() {
        this.sections = [];
        this.selectedSection = null;
        this.surveyService.getSections(this.powerX).subscribe((data) => {
            this.sections = data.data;
            this.selectedSection = this.sections[0];
            this.setupQuestions();
            this.completed = this.sections.map((s) => false);
        });
    }

    tabChange(label) {
        switch (label) {
            case 'Client Survey':
                this.powerX = false;
                break;
            case 'PX Survey':
                this.powerX = true;
                break;
        }
        this.setupSections();
    }

    defaultName(): void {
        /**
        const siteNameQuestion = this.questions.filter((q) => q.code === 'Q1-10');
        if (siteNameQuestion.length > 0) {
            const siteNameQuestionId = this.questions.filter((q) => q.code === 'Q1-10')[0].id;

            if (this.answers.filter((a) => a.id === siteNameQuestionId)[0].value === null) {
                this.answers.filter((a) => a.id === siteNameQuestionId)[0].value = this.siteName;
            }
        }
         */
    }

    formatAnswers(answers, questions) {
        let formattedAns = [];
        for (let key in answers) {
            let ans = answers[key][0];
            formattedAns.push({
                id: ans.id,
                optionId:
                    ans != null &&
                        ans.value != '' &&
                        questions.filter((q) => q.id == ans.id)[0].questionType === 'OPTIONS' &&
                        this.answerOptions[key] != null &&
                        this.answerOptions[key].filter((a) => a.value == ans.value).length > 0
                        ? this.answerOptions[key].filter((a) => a.value == ans.value)[0].id
                        : null,
                dAns:
                    questions.filter((q) => q.id == ans.id)[0].questionType === 'DECIMAL' && ans.value !== ''
                        ? parseFloat(ans.value)
                        : null,
                iAns:
                    questions.filter((q) => q.id == ans.id)[0].questionType === 'INTEGER' && ans.value !== ''
                        ? parseInt(ans.value)
                        : null,
                sAns: questions.filter((q) => q.id == ans.id)[0].questionType === 'VARCHAR' ? ans.value : null,
                bAns: questions.filter((q) => q.id == ans.id)[0].questionType === 'BOOLEAN' ? ans.value : null,
                blob: questions.filter((q) => q.id == ans.id)[0].questionType === 'IMAGE' ? ans.value : null,
            });
        }
        return formattedAns;
    }

    saveLastSection(sendEmail) {
        if (this.selectedSection === this.sections[this.sections.length - 1]) {
            this.setIndex(this.sections.length - 1, sendEmail);
        }
    }

    setIndex(sectionId, sendEmail) {
        const ans = this.formatAnswers(this.answers, this.questions);
        this.surveyService
            .save(this.gsId, this.selectedSection.id, this.powerX, ans)
            .subscribe((result) => {
                this.gsId = parseInt(result.data[0].siteSurveyId);
                if (sectionId >= this.sections.length) {
                    sectionId = this.sections.length;
                }
                if (sectionId < 0) {
                    sectionId = 0;
                }
                if (sendEmail) {
                    this.surveyService.sendEmail(this.gsId).subscribe((res) => {
                        console.log(res);
                        this.matSnackBar.open('Survey Completed Sucessfully', null, { duration: 10000 });
                    });
                }
                this.selectedSection = this.sections[sectionId];
                if (this.selectedSection != null) {
                    this.setupQuestions();
                }
            });
    }

    parseResponse(id, questionType, ans) {
        switch (questionType) {
            case 'BOOLEAN':
                return ans.bAns != null ? ans.bAns.toString() : null;
            case 'DECIMAL':
                return ans.dAns;
            case 'INTEGER':
                return ans.iAns;
            case 'VARCHAR':
                return ans.sAns;
            case 'IMAGE':
                return ans.blob;
            case 'OPTIONS':
                return ans.optionId != null ? this.answerOptions[id].filter((a) => a.id == ans.optionId)[0].value : '';
        }
    }

    getImage(ans) {
        return 'data:image/jpeg;base64,' + btoa(ans);
    }

    openDialog(imageSrc) {
        this.dialog.open(DialogDataExampleDialog, {
            data: {
                src: imageSrc,
            },
        });
    }

    getAnswer(id) {
        if (this.answers && this.answers[id] != undefined && this.answers[id].length > 0)
            return this.answers[id][0].value;
        return null;
    }

    setupQuestions() {
        this.derivedSiteType = '';
        this.surveyService.getQuestions(this.selectedSection.id, this.powerX).subscribe((data) => {
            this.questions = data.data.questions;
            this.dependentQuestions = _.groupBy(data.data.dependentQuestions, function (q) {
                return q.dependenQuestionId;
            });
            this.answerOptions = _.groupBy(data.data.answerOptions, function (q) {
                return q.questionId;
            });
            this.answers = this.questions.map((q) => ({ id: q.id, value: null }));
            this.answers = _.groupBy(this.answers, function (q) {
                return q.id;
            });
            this.questionSets = [];
            this.questions.forEach((q) => {
                q.satisfied = true;
                q.answerProvided = false;
                if (data.data.dependentQuestions.filter((qs) => qs.id == q.id).length > 0) {
                    q.satisfied = false;
                }
                let qIdx = this.questions.indexOf(q);
                if (qIdx % 2 === 0) {
                    let qSet = {
                        0: q.id,
                        1: qIdx + 1 < this.questions.length ? this.questions[qIdx + 1].id : null,
                    };
                    this.questionSets.push(qSet);
                }
            });
            this.surveyService
                .getAnswers(this.gsId, this.selectedSection.id, this.powerX)
                .subscribe((data) => {
                    if (data.data) {
                        if (data.data.answers.length > 0) {
                            this.answers = data.data.answers.map((a) => ({
                                id: a.id,
                                value: this.parseResponse(
                                    this.questions.filter((q) => q.id == a.id)[0].id,
                                    this.questions.filter((q) => q.id == a.id)[0].questionType,
                                    a
                                ),
                            }));

                            this.defaultName();

                            if (this.answers.length > 0) {
                                this.answers = _.groupBy(this.answers, function (q) {
                                    return q.id;
                                });

                                this.questions.forEach((q) => {
                                    this.displayDependencies(q, this.answers[q.id][0].value, true);
                                });

                                const unfinishedManadatoryQuestions = this.questions.filter((q) => {
                                    return (
                                        (q.mandatory && q.satisfied && !q.answerProvided) ||
                                        (q.mandatory && q.satisfied && this.answers[q.id][0].value === '')
                                    );
                                });

                                const allMandatoryQuestionsAnswered = unfinishedManadatoryQuestions.length === 0;
                                this.completed[
                                    this.sections.indexOf(this.selectedSection)
                                ] = allMandatoryQuestionsAnswered;
                            }
                        }

                        if (data.data.depAns.length > 0) {
                            this.depAnswers = data.data.depAns.map((a) => ({
                                id: a.id,
                                depId: a.depId,
                                questionType: a.questionType,
                                resultInt: a.resultInt,
                                resultBoolean: a.resultBoolean,
                                value: this.parseResponse(a.id, a.questionType, a),
                            }));
                        }
                    }
                });

            const unfinishedManadatoryQuestions = this.questions.filter((q) => {
                return (
                    (q.mandatory && q.satisfied && !q.answerProvided) ||
                    (q.mandatory && q.satisfied && this.answers[q.id][0].value === '')
                );
            });

            const allMandatoryQuestionsAnswered = unfinishedManadatoryQuestions.length === 0;
            this.completed[this.sections.indexOf(this.selectedSection)] = allMandatoryQuestionsAnswered;
        });
    }

    getTabColor(tabIndex) {
        if (tabIndex === 0 && !this.powerX) {
            return 'font-size:9px;color:lime';
        } else if (tabIndex === 0 && this.powerX) {
            return 'font-size:9px;color:white';
        } else if (tabIndex === 1 && this.powerX) {
            return 'font-size:9px;color:lime';
        } else if (tabIndex === 1 && !this.powerX) {
            return 'font-size:9px;color:white';
        }
    }

    isDependent(qId) {
        for (var prop in this.dependentQuestions) {
            if (Object.prototype.hasOwnProperty.call(this.dependentQuestions, prop)) {
                if (this.dependentQuestions[prop].filter((dq) => (dq.id == qId)).length > 0) {
                    return true;
                }
            }
        }

        return false;
    }

    setSatisfiedFalse(qId) {
        if (this.dependentQuestions !== undefined && this.dependentQuestions[qId]) {
            this.dependentQuestions[qId]
                .forEach((d) => {
                    this.questions.filter((a) => a.id == d.id)[0].satisfied = false;
                    this.setSatisfiedFalse(d.id);
                });
        }
    }

    setSatisfiedTrue(qId) {
        if (this.dependentQuestions !== undefined && this.dependentQuestions[qId]) {
            let q = this.questions.filter((a) => a.id == qId)[0];
            let answer = this.getAnswer(qId);
            if (q.questionType == 'BOOLEAN') {
                let bAns = (answer == 1 ? true : (answer == 0 ? false : null));
                this.dependentQuestions[q.id].forEach(
                    (d) => (this.questions.filter((a) => a.id == d.id)[0].satisfied = false)
                );
                this.dependentQuestions[q.id]
                    .filter((d) => d.dependentSurveyResultBoolean == bAns)
                    .forEach((d) => {
                        this.questions.filter((a) => a.id == d.id)[0].satisfied = true
                        this.setSatisfiedTrue(d.id);
                    });
                this.dependentQuestions[q.id]
                    .filter((q) => q.dependentSurveyResultBoolean != bAns)
                    .forEach((d) => (this.setSatisfiedFalse(d.id)));
            } else {
                this.dependentQuestions[q.id].forEach(
                    (d) => (this.questions.filter((a) => a.id == d.id)[0].satisfied = false)
                );
                this.dependentQuestions[q.id]
                    .filter((q) => q.dependentSurveyResultInt == answer)
                    .forEach((d) => {
                        this.questions.filter((a) => a.id == d.id)[0].satisfied = true
                        this.setSatisfiedTrue(d.id);
                    });
                this.dependentQuestions[q.id]
                    .filter((q) => q.dependentSurveyResultBoolean != answer)
                    .forEach((d) => (this.setSatisfiedFalse(d.id)));
            }
        }
    }



    displayDependencies(q, ev, initial = false) {
        if (this.dependentQuestions !== undefined && this.dependentQuestions[q.id]) {
            if (ev !== undefined && ev != null) {
                let first: any = _.first(this.dependentQuestions[q.id]);
                let last: any = _.last(this.dependentQuestions[q.id]);
                this.questions.filter((a) => a.id == first.id)[0].hasStartDivider = true;
                this.questions.filter((a) => a.id == last.id)[0].hasEndDivider = true;

                //Setting dependency visibility based on current question
                if (!initial || !this.isDependent(q.id)) {
                    if (q.questionType == 'BOOLEAN') {
                        this.dependentQuestions[q.id].forEach(
                            (d) => (this.questions.filter((a) => a.id == d.id)[0].satisfied = false)
                        );
                        this.dependentQuestions[q.id]
                            .filter((q) => q.dependentSurveyResultBoolean == ev)
                            .forEach((d) => {
                                this.questions.filter((a) => a.id == d.id)[0].satisfied = true
                                this.setSatisfiedTrue(d.id);
                            });
                        this.dependentQuestions[q.id]
                            .filter((q) => q.dependentSurveyResultBoolean != ev)
                            .forEach((d) => (this.setSatisfiedFalse(d.id)));
                    } else {
                        this.dependentQuestions[q.id].forEach(
                            (d) => (this.questions.filter((a) => a.id == d.id)[0].satisfied = false)
                        );

                        this.dependentQuestions[q.id]
                            .filter((q) => q.dependentSurveyResultInt.toString() == ev)
                            .forEach((d) => {
                                this.questions.filter((a) => a.id == d.id)[0].satisfied = true
                                this.setSatisfiedTrue(d.id);
                            });
                        this.dependentQuestions[q.id]
                            .filter((q) => q.dependentSurveyResultInt.toString() != ev)
                            .forEach((d) => (this.setSatisfiedFalse(d.id)));
                    }
                }
            } else {
                this.dependentQuestions[q.id].forEach((d) => (this.questions.filter((a) => a.id == d.id)[0] = true));
            }
        }
        q.answerProvided = ev != null && ev != undefined;

        //Setting state of dependency based on external dependency
        this.dependentQuestions[q.id]?.forEach((dep) => {
            var externalDependencies = this.depAnswers?.filter(
                (a) => this.questions.map((q1) => q1.id).indexOf(a.id) == -1 && a.depId == dep.id
            );
            externalDependencies?.forEach((d) => {
                if (d.questionType == 'BOOLEAN') {
                    if (d.value != d.resultBoolean) this.questions.filter((a) => a.id == dep.id)[0].satisfied = false;
                } else {
                    if (d.value.toString() != d.resultInt.toString())
                        this.questions.filter((a) => a.id == dep.id)[0].satisfied = false;
                }
            });
        });

        const unfinishedManadatoryQuestions = this.questions.filter((q) => {
            return (
                (q.mandatory && q.satisfied && !q.answerProvided) ||
                (q.mandatory && q.satisfied && this.answers[q.id][0].value === '')
            );
        });

        const allMandatoryQuestionsAnswered = unfinishedManadatoryQuestions.length === 0;
        this.completed[this.sections.indexOf(this.selectedSection)] = allMandatoryQuestionsAnswered;
    }

    change(q, ev) {
        this.displayDependencies(q, ev);
    }

    click(q, answer, ev) {
        if (answer?.value !== (ev.target?.innerText === 'Yes' ? '1' : ev.target?.innerText === 'No' ? '0' : '')) {
            this.displayDependencies(q, ev);
        }
        answer.value = null;
    }

    fileChange(event, id) {
        const reader = new FileReader();

        if (event.target.files && event.target.files.length) {
            const [file] = event.target.files;
            reader.readAsBinaryString(file);

            reader.onload = () => {
                //this.imageSrc = reader.result as string;
                this.answers[id][0].value = reader.result;
            };
        }
    }
}
