import { ChangeEvent, FormEvent, useState } from 'react';
import { useSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { db } from '../../services/firebaseConnection';
import {
    doc, collection,
    query, where,
    getDoc, addDoc,
    getDocs, deleteDoc
} from 'firebase/firestore';
import TextArea from '@/src/components/header/textArea';
import Head from 'next/head';
import styles from './styles.module.css';
import { FaTrash} from 'react-icons/fa';

interface TaskProps {
    item: {
        tarefa: string,
        public: boolean,
        created: string,
        user: string,
        taskId: string
    },
    allComments: CommentProps[]
}

interface CommentProps {
    id: string,
    comment: string,
    taskId: string,
    user: string,
    name: string
}


export default function Task({ item, allComments }: TaskProps) {

    const { data: session } = useSession();
    const [input, setInput] = useState('');
    const [comments, setComments] = useState<CommentProps[]>(allComments || []);

    async function handleComment(event: FormEvent) {
        event.preventDefault();
        if (!input)
            return;

        if (!session?.user?.email || !session?.user?.name)
            return;

        try {

            const docRef = await addDoc(collection(db, "comments"), {
                comment: input,
                created: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId,
            });

            const data = {
                id: docRef.id,
                comment: input,
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId,
            }

            setComments((oldItems) => [...oldItems, data])

            setInput('');

        } catch (err) {
            console.error(err);
        }
    }

    async function handleDelete(id: string) {

        try {

            const docRef = doc(db, "comments", id);
            await deleteDoc(docRef);

            const deleteComment = comments.filter((item) => item.id !== id);
            setComments(deleteComment);

        } catch (err) {
            console.error(err);
        }
    }

    return (

        <div className={styles.container}>
            <Head>
                <title>Detalhes da Tarefa</title>
            </Head>

            <main className={styles.main}>
                <h1>Tarefa</h1>
                <article className={styles.task}>
                    <p>{item?.tarefa}</p>
                </article>
            </main>
            <section className={styles.commentsContainer}>
                <h2>Deixar Comentário</h2>
                <form onSubmit={handleComment}>
                    <TextArea
                        value={input}
                        placeholder='Digite seu comentário...'
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                    />
                    <button
                        type='submit'
                        className={styles.button}
                        disabled={!session?.user}
                    >Enviar comentário</button>
                </form>
            </section>

            <section className={styles.commentsContainer}>
                <h2>Todos os Comentários</h2>
                {
                    comments.length === 0 && (
                        <span>Nenhum comentário encontrado</span>
                    )
                }
                {
                    comments && comments.length > 0 && (
                        comments.map((item) => (
                            <article key={item.id} className={styles.comment}>
                                <div className={styles.headComment}>
                                    <label className={styles.commentsLabel}>{item.name}</label>
                                    {
                                        item.user == session?.user?.email && (
                                            <button className={styles.buttonTrash}>
                                                <FaTrash
                                                    size={18}
                                                    color="#ea3140"
                                                    onClick={() => handleDelete(item.id)}
                                                />
                                            </button>
                                        )
                                    }


                                </div>
                                <p>{item.comment}</p>
                            </article>
                        )))
                }
            </section>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {

    const id = params?.id as string;

    const docRef = doc(db, "tarefas", id);
    const snapshot = await getDoc(docRef);
    const q = query(collection(db, 'comments'), where("taskId", "==", id));
    const snapshotComments = await getDocs(q);

    let allComments: CommentProps[] = [];

    snapshotComments.forEach(doc => {
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId
        })
    });

    if (!snapshot.data()) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }

        }
    }

    if (!snapshot.data()?.publica) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }

        }
    }

    const miliseconds = snapshot.data()?.created.seconds * 1000;
    const task = {
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.publica,
        created: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id
    }

    return {
        props: {
            item: task,
            allComments: allComments
        }
    };
};